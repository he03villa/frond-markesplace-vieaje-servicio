import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationsSidebarService {
  readonly show = signal(false);

  toggle() {
    this.show.update(v => !v);
  }

  open() {
    this.show.set(true);
  }

  close() {
    this.show.set(false);
  }
}
