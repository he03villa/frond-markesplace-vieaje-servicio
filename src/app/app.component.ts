import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { distinctUntilChanged, filter, map, Subscription, skip } from 'rxjs';
import { App } from '@capacitor/app';
import { PushNotificationService } from './services/push-notification.service';
import { AuthService } from './services/auth.service';
import { NotificationsSidebarComponent } from './components/notifications-sidebar/notifications-sidebar.component';
import { NotificationsSidebarService } from './services/notifications-sidebar.service';
import { MenuSidebarComponent } from './components/menu-sidebar/menu-sidebar.component';
import { MenuSidebarService } from './services/menu-sidebar.service';
import { ServiceService } from './services/service.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, NotificationsSidebarComponent, MenuSidebarComponent],
})
export class AppComponent implements OnInit, OnDestroy {
  private _router: Router = inject(Router);
  private _pushNotificationService: PushNotificationService = inject(PushNotificationService);
  private _authService: AuthService = inject(AuthService);
  private _service: ServiceService = inject(ServiceService);
  readonly notificationsSidebarService: NotificationsSidebarService = inject(NotificationsSidebarService);
  readonly menuSidebarService: MenuSidebarService = inject(MenuSidebarService);

  private readonly HIDDEN_TAB_ROUTES = [
    'chat-conversation-users',
    'chat-conversation',
    'reviews',
    'my-services',
    'my-rides',
    'stats',
    'settings',
    'notifications'
  ];

  private routerSubscription?: Subscription;
  private authSubscription?: Subscription;
  private pushInitialized = false;

  constructor() { }

  ngOnInit() {
    if (localStorage.getItem('token')) {
      this._pushNotificationService.initPushNotifications();
      this.pushInitialized = true;
    }

    this.authSubscription = this._authService.user.pipe(
      skip(1)
    ).subscribe(user => {
      if (user && !this.pushInitialized) {
        this._pushNotificationService.initPushNotifications();
        this.pushInitialized = true;
      }
    });

    App.addListener('appUrlOpen', (event) => {
      const url = new URL(event.url);
      const path = url.pathname === '' ? '/' : url.pathname;
      const params: Record<string, string> = {};
      url.searchParams.forEach((value, key) => { params[key] = value; });
      this._router.navigate([path], { queryParams: params });
    });

    this.routerSubscription = this._router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).url),
      distinctUntilChanged()
    ).subscribe(url => {
      this.toggleTabBar(url);
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  onViewAllNotifications(): void {
    this.notificationsSidebarService.close();
    this._service.url('/home/notifications');
  }

  private toggleTabBar(url: string): void {
    const shouldHide = this.HIDDEN_TAB_ROUTES.some(route => url.includes(route));
    const element = document.querySelector('ion-tab-bar');
    element?.classList.toggle('d-none', shouldHide);
  }
}
