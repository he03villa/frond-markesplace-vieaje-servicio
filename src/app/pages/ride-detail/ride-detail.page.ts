import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonIcon, IonButtons, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { PageHeaderComponent } from 'src/app/components/page-header/page-header.component';
import { ActivatedRoute } from '@angular/router';
import { ServiceService } from 'src/app/services/service.service';
import { AuthService } from 'src/app/services/auth.service';
import { addIcons } from 'ionicons';
import { addCircle, arrowBack, call, carOutline, carSport, chatbubble, checkmark, checkmarkCircle, closeCircle, ellipseOutline, enter, exit, flag, informationCircleOutline, person, personOutline, play, shareOutline, shieldCheckmark, star, starOutline } from 'ionicons/icons';
import { LocationPickerComponent } from 'src/app/components/location-picker/location-picker.component';
import { RidesService } from 'src/app/services/rides.service';
import { JoinRideModalComponent } from 'src/app/components/join-ride-modal/join-ride-modal.component';
import { Subscription } from 'rxjs';
import { WebsocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-ride-detail',
  templateUrl: './ride-detail.page.html',
  styleUrls: ['./ride-detail.page.scss'],
  standalone: true,
  imports: [DecimalPipe, DatePipe, UpperCasePipe, LocationPickerComponent, IonContent, FormsModule, IonButton, IonIcon, IonButtons, IonRefresher, IonRefresherContent, PageHeaderComponent]
})
export class RideDetailPage implements OnInit, OnDestroy {

  private route: ActivatedRoute = inject(ActivatedRoute);
  _service: ServiceService = inject(ServiceService);
  private authService: AuthService = inject(AuthService);
  private _rideService: RidesService = inject(RidesService);
  private websocketService: WebsocketService = inject(WebsocketService);
  private wsSubscriptions: Subscription[] = [];

  currentUser: any;
  rideId: number;
  ride: any = null;
  selectedSeats: number = 1;
  myRating: number = 0;
  ratingComment: string = '';

  constructor() {
    this.rideId = +this.route.snapshot.paramMap.get('id')!;
    this.registerIcons();
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadRide();
  }

  ionViewWillEnter() {

  }

  ngOnDestroy() {
    // Limpiar suscripciones
    this.wsSubscriptions.forEach(sub => sub.unsubscribe());

    // Dejar canales de WebSocket
    if (this.rideId) {
      this.websocketService.leaveChannel(`ride.${this.rideId}`);
    }
  }

  async loadRide() {
    try {
      const res = await this._rideService.getRide(this.rideId);
      console.log(res);
      this.ride = res.data;
      this.connectToRealtimeUpdates(this.rideId);
    } catch (error) {
      console.error(error);
      this._service.presentToast('Error al cargar detalle del viaje', 'danger');
    }
  }

  private registerIcons() {
    addIcons({
      arrowBack, shareOutline, carSport, checkmark, shieldCheckmark, star, call, chatbubble,
      carOutline, person, personOutline, ellipseOutline, informationCircleOutline, checkmarkCircle, enter, exit,
      addCircle, play, flag, starOutline, closeCircle
    });
  }

  getTimelineProgress(): number {
    if (!this.ride?.timeline) return 0;
    const total = this.ride.timeline.length - 1;
    const done = this.ride.timeline.filter((s: any) => s.done).length;
    return (done / total) * 100;
  }

  isCurrentStep(index: number): boolean {
    if (index === 0) return false;
    const prev = this.ride.timeline[index - 1];
    const curr = this.ride.timeline[index];
    return prev?.done && !curr?.done;
  }

  statusLabel(status: string): string {
    const map: any = {
      available: 'Disponible',
      full: 'Completo',
      in_progress: 'En curso',
      completed: 'Completado',
      cancelled: 'Cancelado',
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      picked_up: 'Recogido',
      dropped_off: 'Entregado'
    };
    return map[status] || status;
  }

  getEstimatedArrival(): Date | null {
    if (!this.ride?.schedule?.departure_time) return null;
    // Asume 1km = 2 min como estimación burda (ajústalo)
    const mins = (this.ride.route.distance_km || 10) * 2;
    return new Date(new Date(this.ride.schedule.departure_time).getTime() + mins * 60000);
  }

  isMySeat(index: number): boolean {
    // Lógica: si soy pasajero confirmado, marca mis asientos
    return this.ride.meta.my_status === 'confirmed' && index < this.ride.meta.my_seats;
  }

  getActionContext(): string {
    if (this.ride.meta.can_join) return 'join';
    if (this.ride.meta.my_status === 'pending') return 'waiting';
    if (this.ride.meta.my_status === 'confirmed') return 'confirmed';
    if (this.ride.meta.my_status === 'picked_up') return 'inprogress';
    if (this.ride.meta.can_start) return 'start';
    if (this.ride.meta.can_complete) return 'complete';
    return 'default';
  }

  async handleRefresh(event: any) {
    await this.loadRide();
    event.target.complete();
  }

  goBack() {
    this._service.url('/home');
  }
  shareRide() {
    // Implementar con Share API o modal
  }
  callDriver() { window.open(`tel:${this.ride.driver.phone}`, '_system'); }
  chatDriver() {
    console.log(this.ride.driver);
    this._service.url(`/home/${this.ride.driver.id}/chat-conversation-users`);
  }

  async reloadRide() {
    await this.loadRide();
  }

  // PASAJERO: Unirse
  async openJoinModal() {
    console.log(this.ride);
    const modal = await this._service.openModal(JoinRideModalComponent, { rideId: this.ride.id, maxSeats: this.ride.seats.available, ridePrice: this.ride.seats.price_per_seat });
    const result = modal;
    if (result.data) {
      console.log(result);
      try {
        const res = await this._rideService.saveJoinRide(this.ride.id, result.data);
        await this.reloadRide();
      } catch (error) {
        console.log(error);
        this._service.presentToast('Error al solicitar viaje', 'danger');
      }
    }
  }

  // PASAJERO: Cancelar mi reserva
  async cancelMyReservation() {
    const alert = await this._service.Alert({
      header: 'Cancelar reserva',
      message: '¿Estás seguro? El conductor será notificado.',
      inputs: [{ name: 'reason', type: 'text', placeholder: 'Motivo (opcional)' }],
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Sí, cancelar',
          handler: async (data: any) => {
            try {
              const res: any = await this._rideService.saveCancel(this.ride.id, data.reason);
              this.loadRide();
            } catch (error) {
              console.log(error);
              this._service.presentToast('Error al cancelar reserva', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async startRide() {
    const res: any = await this._service.Alert({
      header: 'Iniciar viaje',
      message: '¿Todos los pasajeros confirmados están listos?',
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Iniciar', handler: async () => {
            try {
              const res = await this._rideService.saveStart(this.ride.id, {});
              this.loadRide();
            } catch (error) {
              console.log(error);
              this._service.presentToast('Error al iniciar viaje', 'danger');
            }
          }
        }
      ]
    });
  }

  async cancelRide() {
    /* const isDriver = this.ride.meta.is_driver;
    const alert = await this.alertCtrl.create({
      header: isDriver ? 'Cancelar viaje completo' : 'Cancelar mi reserva',
      message: isDriver 
        ? 'Todos los pasajeros serán notificados y sus reservas canceladas.' 
        : 'Se liberarán tus asientos.',
      inputs: !isDriver ? [{ name: 'reason', type: 'text', placeholder: 'Motivo' }] : [],
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Sí, cancelar', handler: (data) => {
          this.rideService.cancelRide(this.ride.id, { reason: data?.reason })
            .subscribe(() => this.loadRide(this.ride.id));
        }}
      ]
    });
    await alert.present(); */
  }

  // Acciones pasajero
  async confirmPassenger(id: number) {
    const loading = await this.presentLoading('Confirmando...');
    try {
      const res: any = await this._rideService.savePassenger(this.ride.id, id, {});
      await this.reloadRide();
      await loading.dismiss();
    } catch (error) {
      console.log(error);
      this._service.presentToast('Error al confirmar pasajero', 'danger');
      await loading.dismiss();
    }
  }

  async pickupPassenger(id: number) {
    const loading = await this.presentLoading('Confirmando...');
    try {
      const res: any = await this._rideService.savePickup(this.ride.id, id, {});
      this.reloadRide();
      await loading.dismiss();
    } catch (error) {
      this._service.presentToast('Error al recoger pasajero', 'danger');
      await loading.dismiss();
    }
  }

  async dropoffPassenger(id: number) {
    const loading = await this.presentLoading('Confirmando...');
    try {
      const res: any = await this._rideService.saveDropoff(this.ride.id, id, {});
      this.reloadRide();
      await loading.dismiss();
    } catch (error) {
      this._service.presentToast('Error al dejar pasajero', 'danger');
      await loading.dismiss();
    }
  }

  async completeRide() {
    const alert = await this._service.Alert({
      header: '¿Completar viaje?',
      message: 'Confirma que llegaste al destino final.',
      cssClass: 'ux-alert',
      buttons: [
        { text: 'Aún no', role: 'cancel' },
        {
          text: 'Completar',
          handler: async () => {
            const loading = await this.presentLoading('Finalizando...');
            try {
              const res = await this._rideService.saveComplete(this.ride.id, {});
              loading.dismiss();
              this.presentToast('¡Viaje completado!', 'success');
              this.reloadRide();
            } catch (error) {
              this._service.presentToast('Error al completar viaje', 'danger');
              loading.dismiss();
            }
          }
        }
      ]
    });
  }

  setRating(n: number) { this.myRating = n; }

  async submitRating() {
    const loading = await this.presentLoading('Enviando calificación...');
    try {
      const data = {
        target_user_id: this.ride.driver.id,
        rating: this.myRating,
        comment: this.ratingComment
      };
      const res = await this._rideService.saveRate(this.ride.id, data);
      loading.dismiss();
      this.presentToast('¡Gracias por tu calificación!', 'success');
      this.reloadRide();
    } catch (error) {
      this._service.presentToast('Error al enviar calificación', 'danger');
      loading.dismiss();
    }
  }

  async presentToast(message: string, color: string = 'primary') {
    this._service.presentToast(message, color);
  }

  async presentLoading(message: string) {
    const loading = await this._service.presentLoading({ message, spinner: 'crescent' });
    await loading.present();
    return loading;
  }

  connectToRealtimeUpdates(serviceId: number) {
    // Conectar WebSocket si no está conectado
    if (!this.websocketService.isConnected()) {
      this.websocketService.connect();
    }

    // Escuchar todos los eventos del servicio
    this.websocketService.listenToRide(serviceId, (data) => {
      console.log('🚗 Ride event:', data);
      switch (data.type) {
        case 'ride.status_changed':
          // Actualizar estado del ride en la UI sin recargar todo
          this.ride.status = data.status;

          if (data.status === 'in_progress') {
            this.presentToast('🚀 El viaje ha iniciado', 'primary');
          }
          if (data.status === 'completed') {
            this.presentToast('✅ Viaje completado', 'success');
            this.reloadRide(); // Recargar para mostrar opción de calificar
          }
          if (data.status === 'cancelled') {
            this.presentToast(`❌ Viaje cancelado: ${data.reason || ''}`, 'danger');
            this.reloadRide();
          }
          break;
        case 'passenger.joined':
          if (this.ride?.meta?.is_driver) {
            this.presentToast('👤 Nueva solicitud de pasajero', 'warning');
            this.reloadRide(); // Recargar para ver el nuevo pasajero en la lista
          }
          break;
        case 'passenger.status_changed':
          if (this.ride?.passengers) {
            const passenger = this.ride.passengers.find(
              (p: any) => p.id === data.passenger_id
            );
            if (passenger) {
              passenger.pivot.status = data.status;
            }
          }
          break;
      }
    });

    // Si el usuario está autenticado, escuchar sus notificaciones personales
    if (this.currentUser?.id) {
      this.websocketService.listenToUserNotifications(this.currentUser.id, (data) => {
        console.log('🔔 User event:', data);
        switch (data.type) {
          case 'passenger_status_changed':
            console.log('🔔 User event:', data);
            if (data.status === 'confirmed') {
              this.presentToast('🎉 ¡Tu reserva fue confirmada!', 'success');
              this.reloadRide();
            }
            if (data.status === 'cancelled') {
              this.presentToast('❌ Tu reserva fue cancelada', 'danger');
              this.reloadRide();
            }
            if (data.status === 'picked_up') {
              this.presentToast('🚗 ¡El conductor te recogió!', 'primary');
              this.ride.meta.my_status = 'picked_up';
            }
            if (data.status === 'dropped_off') {
              this.presentToast('📍 Llegaste a tu destino', 'success');
              this.reloadRide(); // Recargar para mostrar opción de calificar
            }
            break;
          case 'passenger_joined':
            console.log('🔔 User event:', data);
            if (this.ride?.meta?.is_driver) {
              this.presentToast('👤 Nueva solicitud de pasajero', 'warning');
              this.reloadRide(); // Recargar para ver el nuevo pasajero en la lista
            }
            break;
        }
      });
    }
  }

}
