import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { ServiceService } from '../services/service.service';

export const onboardingGuard: CanActivateFn = () => {
  const _service = inject(ServiceService);
  if (localStorage.getItem('seen_onboarding') === 'true') {
    return true;
  }
  _service.url('/onboarding');
  return false;
};
