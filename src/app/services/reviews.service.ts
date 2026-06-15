import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DataService } from './data.service';
import { ServiceService } from './service.service';

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  private apiUser = `${environment.apiUrl}/${environment.api.reviews.name}`;
  private _data: DataService = inject(DataService);
  private _service: ServiceService = inject(ServiceService);

  saveReview(data: any) {
    const url = `${this.apiUser}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  getUsersReviews(id: number) {
    const url = `${this.apiUser}/${environment.api.reviews.services.users}/${id}`;
    return this._service.promise(this._data.metodoGet(url));
  }

  saveLike(id: number) {
    const url = `${this.apiUser}/${id}/${environment.api.reviews.services.like}`;
    return this._service.promise(this._data.metodoPost(url, {}));
  }

  saveHelpful(id: number) {
    const url = `${this.apiUser}/${id}/${environment.api.reviews.services.helpful}`;
    return this._service.promise(this._data.metodoPost(url, {}));
  }

  saveReport(id: number, data: any) {
    const url = `${this.apiUser}/${id}/${environment.api.reviews.services.report}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  saveReply(id: number, data: any) {
    const url = `${this.apiUser}/${id}/${environment.api.reviews.services.reply}`;
    return this._service.promise(this._data.metodoPost(url, data));
  }

  updateReply(id: number, data: any) {
    const url = `${this.apiUser}/${id}/${environment.api.reviews.services.reply}`;
    return this._service.promise(this._data.metodoPut(url, data));
  }

  deleteReply(id: number) {
    const url = `${this.apiUser}/${id}/${environment.api.reviews.services.reply}`;
    return this._service.promise(this._data.metodoDelete(url));
  }
}
