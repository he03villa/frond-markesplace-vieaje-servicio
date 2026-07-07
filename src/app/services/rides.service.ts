import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DataService } from './data.service';
import { ServiceService } from './service.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RidesService {
  private apiUser = `${environment.apiUrl}/${environment.api.rides.name}`;
  private _data: DataService = inject(DataService);
  private _service: ServiceService = inject(ServiceService);

  getMyRides(data: any = {}) {
    let params = new HttpParams();
    params = params.set('page', data.page || 1);
    if (data.status !== 'all' && data.status) {
      params = params.set('status', data.status);
    }
    const url = `${this.apiUser}/${environment.api.rides.services.myRides}?${params.toString()}`;
    return this._service.promise(this._data.metodoGet(url));
  }

  getAllRides(data: any = {}) {
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

  getRide(id: number) {
    const url = `${this.apiUser}/${id}`;
    return this._service.promise(this._data.metodoGet(url));
  }

  saveRide(data: any) {
    const url = `${this.apiUser}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  saveJoinRide(id: number, data: any) {
    const url = `${this.apiUser}/${id}/${environment.api.rides.services.join}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  savePassenger(id: number, passengerId: number, data: any) {
    const url = `${this.apiUser}/${id}/${environment.api.rides.services.passengers}/${passengerId}/${environment.api.rides.services.confirm}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  saveStart(id: number, data: any) {
    const url = `${this.apiUser}/${id}/${environment.api.rides.services.start}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  savePickup(id: number, passengerId: number, data: any) {
    const url = `${this.apiUser}/${id}/${environment.api.rides.services.pickup}/${passengerId}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  saveDropoff(id: number, passengerId: number, data: any) {
    const url = `${this.apiUser}/${id}/${environment.api.rides.services.dropoff}/${passengerId}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  saveComplete(id: number, data: any) {
    const url = `${this.apiUser}/${id}/${environment.api.rides.services.complete}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  saveCancel(id: number, data: any) {
    const url = `${this.apiUser}/${id}/${environment.api.rides.services.cancel}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  saveRate(id: number, data: any) {
    const url = `${this.apiUser}/${id}/${environment.api.rides.services.rate}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  getStats(data: any) {
    let params = new HttpParams();
    params = params.set('period', data.period);

    const url = `${this.apiUser}/${environment.api.rides.services.stats}?${params.toString()}`;
    return this._service.promise(this._data.metodoGet(url));
  }
}
