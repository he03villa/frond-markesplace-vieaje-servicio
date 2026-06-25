import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { distinctUntilChanged, filter, map, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {
  private _router: Router = inject(Router);
  private readonly HIDDEN_TAB_ROUTES = [
    'chat-conversation-users',
    'chat-conversation',
    'reviews',
    'my-services',
    'my-rides',
    'stats',
    'settings'
  ];

  private routerSubscription?: Subscription;

  constructor() { }

  ngOnInit() {
    this.routerSubscription = this._router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).url),
      distinctUntilChanged()
    ).subscribe(url => {
      this.toggleTabBar(url);
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  private toggleTabBar(url: string): void {
    const shouldHide = this.HIDDEN_TAB_ROUTES.some(route => url.includes(route));
    const element = document.querySelector('ion-tab-bar');
    element?.classList.toggle('d-none', shouldHide);
  }
}
