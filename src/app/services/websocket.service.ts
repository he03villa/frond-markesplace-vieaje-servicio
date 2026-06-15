import { inject, Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
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

  listenToService(serviceId: number, callback: (data: any) => void): void {
    if (!this.echo) {
      console.error('WebSocket no conectado');
      return;
    }

    this.echo.private(`service.${serviceId}`)
      .listen('.offer.created', (data: any) => {
        console.log('📨 Nueva oferta:', data);
        callback({ type: 'created', ...data });
      })
      .listen('.offer.accepted', (data: any) => {
        console.log('✅ Oferta aceptada:', data);
        callback({ type: 'accepted', ...data });
      })
      .listen('.offer.rejected', (data: any) => {
        console.log('❌ Oferta rechazada:', data);
        callback({ type: 'rejected', ...data });
      })
      .listen('.DeliveryStatusChanged', (data: any) => {
        console.log('🚚 Estado de entrega cambiado:', data);
        callback({ type: 'delivery.status_changed', ...data });
      });
  }

  listenToUserNotifications(userId: number, callback: (data: any) => void): void {
    if (!this.echo) {
      console.error('WebSocket no conectado');
      return;
    }

    console.log('Escuchando notificaciones de usuario', userId);

    this.echo.private(`user.${userId}`)
      .listen('.offer.created', (data: any) => {
        callback({ type: 'created', ...data });
      })
      .listen('.offer.accepted', (data: any) => {
        callback({ type: 'accepted', ...data });
      })
      .listen('.offer.rejected', (data: any) => {
        callback({ type: 'rejected', ...data });
      })
      .listen('.PassengerStatusChanged', (data: any) => {
        callback({ type: 'passenger_status_changed', ...data });
      })
      .listen('.PassengerJoined', (data: any) => {
        console.log('👤 Nueva solicitud de pasajero', data);
        callback({ type: 'passenger_joined', ...data });
      });
  }

  listenToRide(rideId: number, callback: (data: any) => void): void {
    if (!this.echo) {
      console.error('WebSocket no conectado');
      return;
    }

    console.log('Escuchando notificaciones de viaje', rideId);

    this.echo.private(`ride.${rideId}`)
      .listen('.RideStatusChanged', (data: any) => {
        callback({ type: 'ride.status_changed', ...data });
      })
      .listen('.PassengerJoined', (data: any) => {
        callback({ type: 'passenger.joined', ...data });
      })
      .listen('.PassengerStatusChanged', (data: any) => {
        callback({ type: 'passenger.status_changed', ...data });
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
