import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DataService } from './data.service';
import { ServiceService } from './service.service';

@Injectable({
  providedIn: 'root',
})
export class OffersService {
  private apiUser = `${environment.apiUrl}/${environment.api.offers.name}`;
  private _data: DataService = inject(DataService);
  private _service: ServiceService = inject(ServiceService);

  getMyOffers() {
    const url = `${this.apiUser}/${environment.api.offers.services.myOffers}`;
    return this._service.promise(this._data.metodoGet(url));
  }

  saveOffer(data: any) {
    const url = `${this.apiUser}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  saveAcceptOffer(id: number, data: any) {
    const url = `${this.apiUser}/${id}/${environment.api.offers.services.accept}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }
}
