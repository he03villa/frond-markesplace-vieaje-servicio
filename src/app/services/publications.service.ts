import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DataService } from './data.service';
import { ServiceService } from './service.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PublicationsService {
  private apiUser = `${environment.apiUrl}/${environment.api.publications.name}`;
  private _data: DataService = inject(DataService);
  private _service: ServiceService = inject(ServiceService);

  getMyPublications(data: any = undefined) {
    let params = new HttpParams();
    if (data?.category) {
      params = params.set('category', data.category);
    }
    if (data?.status) {
      params = params.set('status', data.status);
    }
    if (data?.search) {
      params = params.set('search', data.search);
    }
    const url = `${this.apiUser}?${params.toString()}`;
    return this._service.promise(this._data.metodoGet(url));
  }

  getMyPublicationsStats() {
    const url = `${ this.apiUser }/${ environment.api.publications.services.stats }`;
    return this._service.promise(this._data.metodoGet(url));
  }

  getMyPublicationsSummary() {
    const url = `${ this.apiUser }/${ environment.api.publications.services.summary }`;
    return this._service.promise(this._data.metodoGet(url));
  }

  getMyPublicationsExplore(data: any = undefined) {
    let params = new HttpParams();
    if (data?.category) {
      params = params.set('category', data.category);
    }
    if (data?.sub_category) {
      params = params.set('sub_category', data.sub_category);
    }
    if (data?.status) {
      params = params.set('status', data.status);
    }
    if (data?.search && data.search.length > 0) {
      params = params.set('q', data.search);
    }
    if (data?.lat) {
      params = params.set('lat', data.lat);
    }
    if (data?.lng) {
      params = params.set('lng', data.lng);
    }
    if (data?.sort) {
      params = params.set('sort', data.sort);
    }
    const url = `${ this.apiUser }/${ environment.api.publications.services.explore }?${ params.toString() }`;
    return this._service.promise(this._data.metodoGet(url));
  }
}
