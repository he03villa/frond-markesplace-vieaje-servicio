import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { DataService } from '../services/data.service';
import { environment } from 'src/environments/environment';

let isRefreshing = false;
let refreshSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const dataService = inject(DataService);
  const token = localStorage.getItem('token');

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  if (req.url.includes('/auth/refresh')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token) {
        return handle401(req, next, dataService);
      }
      return throwError(() => error);
    })
  );
};

function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  dataService: DataService
): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshSubject.next(null);

    const refreshUrl = `${environment.apiUrl}/${environment.api.user.name}/${environment.api.user.services.refresh}`;

    return dataService.metodoPost(refreshUrl, {}).pipe(
      switchMap((response: any) => {
        isRefreshing = false;
        const newToken = response?.data?.access_token;
        if (newToken) {
          localStorage.setItem('token', newToken);
          refreshSubject.next(newToken);
          return next(req.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`,
              'X-Retry-After-Refresh': 'true'
            }
          }));
        }
        return throwError(() => new Error('Refresh failed'));
      }),
      catchError((err) => {
        isRefreshing = false;
        localStorage.removeItem('token');
        localStorage.removeItem('dataUser');
        const router = inject(Router);
        router.navigateByUrl('/login?sessionExpired=true');
        return throwError(() => err);
      })
    );
  } else {
    return refreshSubject.pipe(
      filter((t): t is string => t !== null),
      take(1),
      switchMap((newToken) =>
        next(req.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` }
        }))
      )
    );
  }
}
