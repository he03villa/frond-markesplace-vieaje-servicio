import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DataService } from './data.service';
import { ServiceService } from './service.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiBase = `${environment.apiUrl}/${environment.api.userNotifications.name}`;
  private _data: DataService = inject(DataService);
  private _service: ServiceService = inject(ServiceService);

  getNotifications(page: number = 1, perPage: number = 15) {
    const url = `${this.apiBase}/${environment.api.userNotifications.services.list}?page=${page}&per_page=${perPage}`;
    return this._service.promise(this._data.metodoGet(url));
  }

  getUnreadCount() {
    const url = `${this.apiBase}/${environment.api.userNotifications.services.unreadCount}`;
    return this._service.promise(this._data.metodoGet(url));
  }

  markAsRead(id: string) {
    const url = `${this.apiBase}/${environment.api.userNotifications.services.markAsRead.replace('{id}', id)}`;
    return this._service.promise(this._data.metodoPatch(url, {}));
  }

  markAllAsRead() {
    const url = `${this.apiBase}/${environment.api.userNotifications.services.markAllAsRead}`;
    return this._service.promise(this._data.metodoPost(url, {}));
  }
}
