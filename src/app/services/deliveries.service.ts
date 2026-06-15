import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DataService } from './data.service';
import { ServiceService } from './service.service';

@Injectable({
  providedIn: 'root',
})
export class DeliveriesServices {
  private apiUser = `${environment.apiUrl}/${environment.api.deliveries.name}`;
  private _data: DataService = inject(DataService);
  private _service: ServiceService = inject(ServiceService);

  saveResponse(id:number, data:any) {
    const url = `${this.apiUser}/${id}/${environment.api.deliveries.services.respond}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  respond(id:number, data:any) {
    const url = `${this.apiUser}/${id}/${environment.api.deliveries.services.respond}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }
}
