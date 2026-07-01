import { inject, Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { DataService } from './data.service';
import { ServiceService } from './service.service';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  private _data: DataService = inject(DataService);
  private _service: ServiceService = inject(ServiceService);
  private _router: Router = inject(Router);

  private initialized = false;
  private currentToken: string | null = null;

  async initPushNotifications() {
    if (this.initialized) return;
    this.initialized = true;

    const platform = Capacitor.getPlatform();

    if (platform === 'web') {
      await this.initWebPush();
    } else {
      await this.initNativePush();
    }
  }

  private async initWebPush() {
    try {
      const { initializeApp } = await import('firebase/app');
      const { getMessaging, getToken, onMessage } = await import('firebase/messaging');

      const firebaseApp = initializeApp(environment.firebase);
      const messaging = getMessaging(firebaseApp);

      let swRegistration: ServiceWorkerRegistration | undefined;
      if ('serviceWorker' in navigator) {
        swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      }

      const token = await getToken(messaging, {
        ...(swRegistration && { serviceWorkerRegistration: swRegistration }),
        vapidKey: environment.firebase.vapidKey,
      });

      if (token) {
        this.currentToken = token;
        await this.registerToken(token, 'web');
      }

      onMessage(messaging, (payload: any) => {
        this.showForegroundNotification(payload);
      });
    } catch (error) {
      console.error('Error initializing web push:', error);
    }
  }

  private async initNativePush() {
    try {
      let permResult = await PushNotifications.checkPermissions();
      if (permResult.receive === 'prompt') {
        permResult = await PushNotifications.requestPermissions();
      }
      if (permResult.receive !== 'granted') return;

      await PushNotifications.register();

      PushNotifications.addListener('registration', (token: Token) => {
        this.currentToken = token.value;
        const platform = Capacitor.getPlatform();
        this.registerToken(token.value, platform);
      });

      PushNotifications.addListener('registrationError', (err: any) => {
        console.error('Push registration error:', err);
      });

      PushNotifications.addListener(
        'pushNotificationReceived',
        (notification: any) => {
          this.showForegroundNotification(notification);
        }
      );

      PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (notification: any) => {
          const data = notification.notification.data;
          this.handleNotificationTap(data);
        }
      );
    } catch (error) {
      console.error('Error initializing native push:', error);
    }
  }

  private async registerToken(deviceToken: string, platform: string) {
    try {
      const url = `${environment.apiUrl}/${environment.api.notifications.name}/${environment.api.notifications.services.deviceToken}`;
      await this._service.promise(
        this._data.metodoPost(url, {
          device_token: deviceToken,
          platform: platform,
          device_name: Capacitor.getPlatform() === 'web' ? this.getWebDeviceName() : undefined,
        })
      );
    } catch (error) {
      console.error('Error registering push token:', error);
    }
  }

  async unregisterToken() {
    if (!this.currentToken) return;

    try {
      const url = `${environment.apiUrl}/${environment.api.notifications.name}/${environment.api.notifications.services.deviceToken}`;
      await this._service.promise(this._data.metodoDelete(url));
      this.currentToken = null;
    } catch (error) {
      console.error('Error unregistering push token:', error);
    }
  }

  private getWebDeviceName(): string {
    const ua = navigator.userAgent;
    const browser = ua.includes('Edg') ? 'Edge' : ua.includes('Firefox') ? 'Firefox' : ua.includes('OPR') || ua.includes('Opera') ? 'Opera' : 'Chrome';
    const os = ua.includes('Win') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Linux') ? 'Linux' : 'desktop';
    return `Web - ${browser} ${os}`;
  }

  private showForegroundNotification(notification: any) {
    const title = notification.title || 'Nueva notificación';
    const body = notification.body || notification.alert || '';

    if (title || body) {
      this._service.presentToast(`${title}${body ? ': ' + body : ''}`, 'primary');
    }
  }

  private handleNotificationTap(data: any) {
    if (!data) return;

    const route = data.route || data.url || null;
    if (route) {
      this._router.navigate([route]);
    }
  }
}
