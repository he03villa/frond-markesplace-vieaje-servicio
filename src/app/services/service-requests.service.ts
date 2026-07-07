import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DataService } from './data.service';
import { ServiceService } from './service.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ServiceRequestsService {
  private apiUser = `${environment.apiUrl}/${environment.api.serviceRequests.name}`;
  private _data: DataService = inject(DataService);
  private _service: ServiceService = inject(ServiceService);

  getAllRequests(data: any = {}) {
    let params = new HttpParams();
    if (data.lat) {
      params = params.set('lat', data.lat);
    }
    if (data.lng) {
      params = params.set('lng', data.lng);
    }
    const url = `${this.apiUser}?${params.toString()}`;
    return this._service.promise(this._data.metodoGet(url));
  }

  getMyRequests(data: any = {}) {
    let params = new HttpParams();
    params = params.set('page', data.page || 1);
    if (data.status !== 'all' && data.status) {
      params = params.set('status', data.status);
    }
    const url = `${this.apiUser}/${environment.api.serviceRequests.services.myRequests}?${params.toString()}`;
    return this._service.promise(this._data.metodoGet(url));
  }

  saveRequest(data: any) {
    const url = `${this.apiUser}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  updateRequest(id: number, data: any) {
    const url = `${this.apiUser}/${id}`;
    return this._service.promise(this._data.metodoPut(url, data));
  }

  deleteRequest(id: number) {
    const url = `${this.apiUser}/${id}`;
    return this._service.promise(this._data.metodoDelete(url));
  }

  getRequest(id: number) {
    const url = `${this.apiUser}/${id}`;
    return this._service.promise(this._data.metodoGet(url));
  }

  saveDeliverRequest(id: number, data:any) {
    const url = `${this.apiUser}/${id}/${environment.api.serviceRequests.services.deliver}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }
}
