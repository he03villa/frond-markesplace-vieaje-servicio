import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ServiceService } from '../services/service.service';

export const authGuard: CanActivateFn = (route, state) => {
  const _service = inject(ServiceService);
  if (localStorage.getItem('token')) {
    return true;
  }
  _service.url('/login');
  return false;
};
