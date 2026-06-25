import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DataService } from './data.service';
import { ServiceService } from './service.service';
import { BehaviorSubject } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUser = `${environment.apiUrl}/${environment.api.user.name}`;
  private apiProfile = `${environment.apiUrl}/${environment.api.profile.name}`;
  private apiBaseUser = `${environment.apiUrl}/${environment.api.user.services.users}`;
  private apiBaseEmail = `${environment.apiUrl}/${environment.api.email.name}/${environment.api.email.services.verify}`;
  private _data: DataService = inject(DataService);
  private _service: ServiceService = inject(ServiceService);

  user: BehaviorSubject<any> = new BehaviorSubject(null);

  emitUser(user: any) {
    this.user.next(user);
  }

  saveSession(data: { access_token: string; user: any }) {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('dataUser', JSON.stringify(data.user));
    this.emitUser(data.user);
  }

  login(data: any) {
    const url = `${this.apiUser}/${environment.api.user.services.login}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  register(data: any) {
    const url = `${this.apiUser}/${environment.api.user.services.register}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  logout() {
    const url = `${this.apiUser}/${environment.api.user.services.logout}`;
    return this._service.promise(this._data.metodoPost(url, {}));
  }

  me() {
    const url = `${this.apiUser}/${environment.api.user.services.me}`;
    return this._service.promise(this._data.metodoGet(url));
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getCurrentUser() {
    const localUser = localStorage.getItem('dataUser');
    const user = localUser ? JSON.parse(localUser) : null;
    return user;
  }

  getProfile() {
    const url = `${this.apiProfile}`;
    return this._service.promise(this._data.metodoGet(url));
  }

  updateProfile(data: any) {
    const url = `${this.apiProfile}`;
    return this._service.promise(this._data.metodoPut(url, data));
  }

  saveAvatar(avatar: File) {
    const data = new FormData();
    data.append('avatar', avatar);

    const url = `${this.apiProfile}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  getReviews(id: number, data: any = undefined) {
    let params = new HttpParams();
    params = params.set('page', data.page);
    if (data?.sort) {
      params = params.set('sort', data.sort);
    }
    const url = `${this.apiBaseUser}/${id}/${environment.api.user.services.reviews}?${params.toString()}`;
    return this._service.promise(this._data.metodoGet(url));
  }

  saveReviews(id: number, data: any) {
    const url = `${this.apiBaseUser}/${id}/${environment.api.user.services.reviews}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  changePassword(data:any) {
    const url = `${this.apiUser}/${environment.api.user.services.changePassword}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  sendVerifyEmail(data: any) {
    const url = `${this.apiBaseEmail}/${environment.api.email.services.send}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  getVerifyEmail(data: any) {
    const url = `${this.apiBaseEmail}/${data}`;
    return this._service.promise(this._data.metodoGet(url));
  }

  updateHasNotification(data: any) {
    const url = `${this.apiUser}/${environment.api.user.services.updateHasNotification}`;
    return this._service.promise(this._data.metodoPatch(url, data));
  }

  deleteAccount(data: any) {
    const url = `${this.apiUser}/${environment.api.user.services.account}`;
    return this._service.promise(this._data.metodoDelete(url, data));
  }

  forgetPassword(data: any) {
    const url = `${this.apiUser}/${environment.api.user.services.forgotPassword}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  verifyOtp(data: any) {
    const url = `${this.apiUser}/${environment.api.user.services.verifyOtp}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  resetPassword(data: any) {
    const url = `${this.apiUser}/${environment.api.user.services.resetPassword}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }
}
