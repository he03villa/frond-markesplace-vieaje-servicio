import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { ServiceService } from '../services/service.service';

export const loginGuard: CanActivateFn = () => {
  const _service = inject(ServiceService);
  if (localStorage.getItem('token')) {
    _service.url('/home');
    return false;
  }
  return true;
};
