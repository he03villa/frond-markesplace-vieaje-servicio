import { inject, Injectable } from '@angular/core';
import { DataService } from './data.service';
import { ServiceService } from './service.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MyAssignmentsService {
  private apiUser = `${environment.apiUrl}/${environment.api.myAssignments.name}`;
  private _data: DataService = inject(DataService);
  private _service: ServiceService = inject(ServiceService);

  getMyAssignments() {
    const url = `${this.apiUser}`;
    return this._service.promise(this._data.metodoGet(url));
  }

  getMyServicesAsWorker() {
    const url = `${this.apiUser}/${environment.api.myAssignments.services.services}`;
    return this._service.promise(this._data.metodoGet(url));
  }

  getMyRidesAsDriver() {
    const url = `${this.apiUser}/${environment.api.myAssignments.services.rides}/${environment.api.myAssignments.services.driver}`;
    return this._service.promise(this._data.metodoGet(url));
  }

  getMyRidesAsPassenger() {
    const url = `${this.apiUser}/${environment.api.myAssignments.services.rides}/${environment.api.myAssignments.services.passenger}`;
    return this._service.promise(this._data.metodoGet(url));
  }
}
