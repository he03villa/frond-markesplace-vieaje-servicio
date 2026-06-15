import { inject, Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import Pusher from 'pusher-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatSocketService {
  private echo: Echo<any> | null = null;
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private authService: AuthService = inject(AuthService);

  public connectionStatus$ = this.connectionStatus.asObservable();

  constructor() {
    (window as any).Pusher = Pusher;
  }

  connect(): void {
    const token = this.authService.getToken();

    if (!token) {
      console.error('No hay token de autenticación');
      return;
    }

    this.echo = new Echo({
      broadcaster: 'pusher',
      key: environment.VITE_REVERB_APP_KEY,
      cluster: environment.cluster,
      wsHost: environment.VITE_REVERB_HOST,
      wsPort: environment.VITE_REVERB_PORT,
      wssPort: environment.VITE_REVERB_PORT,
      forceTLS: environment.VITE_REVERB_SCHEME === 'https',
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${environment.apiUrl}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });

    this.echo.connector.pusher.connection.bind('connected', () => {
      console.log('WebSocket conectado');
      this.connectionStatus.next(true);
    });

    this.echo.connector.pusher.connection.bind('disconnected', () => {
      console.log('WebSocket desconectado');
      this.connectionStatus.next(false);
    });

    this.echo.connector.pusher.connection.bind('error', (err: any) => {
      console.error('Error de WebSocket:', err);
      this.connectionStatus.next(false);
    });
  }

  disconnect(): void {
    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
      this.connectionStatus.next(false);
    }
  }

  listenToConversation(conversationId: number, callback: (data: any) => void): void {
    if (!this.echo) {
      console.error('WebSocket no conectado');
      return;
    }

    this.echo.private(`conversation.${conversationId}`)
      .listen('.user.typing', (data: any) => {
        console.log('📨 User typing', data);
        callback({ type: 'typing', ...data });
      })
      .listen('.message.sent', (data: any) => {
        console.log('📨 Message sent', data);
        callback({ type: 'message.sent', ...data });
      })
      .listen('.messages.read', (data: any) => {
        console.log('📨 Messages read', data);
        callback({ type: 'messages.read', ...data });
      });
  }

  leaveChannel(channel: string): void {
    if (this.echo) {
      this.echo.leave(channel);
    }
  }

  isConnected(): boolean {
    return this.connectionStatus.value;
  }
}
