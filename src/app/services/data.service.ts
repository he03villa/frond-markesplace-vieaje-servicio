import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private _http: HttpClient = inject(HttpClient);
  constructor() { }

  metodoGet(url: string) {
    return this._http.get(url);
  }

  metodoPost(url: string, body: any) {
    return this._http.post(url, body);
  }

  metodoPut(url: string, body: any) {
    return this._http.put(url, body);
  }

  metodoPatch(url: string, body: any) {
    return this._http.patch(url, body);
  }

  metodoDelete(url: string, body: any = undefined) {
    if (body) return this._http.delete(url, { body });
    return this._http.delete(url);
  }
}
