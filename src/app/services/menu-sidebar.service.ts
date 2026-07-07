import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MenuSidebarService {
  readonly show = signal(false);

  toggle() {
    this.show.update(v => !v);
  }

  open() {
    this.show.set(true);
  }

  close() {
    this.show.set(false);
    document.querySelector('.menu-morph')?.classList.remove('active');
  }
}
