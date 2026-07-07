import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular, createAnimation } from '@ionic/angular/standalone';
import type { AnimationBuilder } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/interceptor/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';

const navAnimation: AnimationBuilder = (_, opts) => {
  const enteringEl = opts?.enteringEl;
  const leavingEl = opts?.leavingEl;
  const anim = createAnimation().duration(300).easing('cubic-bezier(0.4, 0, 0.2, 1)');
  if (enteringEl) {
    anim.addAnimation(
      createAnimation()
        .addElement(enteringEl)
        .fromTo('opacity', '0', '1')
        .fromTo('transform', 'translateY(10px)', 'translateY(0)')
    );
  }
  if (leavingEl) {
    anim.addAnimation(
      createAnimation()
        .addElement(leavingEl)
        .fromTo('opacity', '1', '0')
        .fromTo('transform', 'translateY(0)', 'translateY(-10px)')
    );
  }
  return anim;
};

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ navAnimation }),
    provideAnimations(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withFetch()
    ),
  ],
});
