import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonButtons, IonButton, IonRefresher, IonRefresherContent, IonSkeletonText } from '@ionic/angular/standalone';
import { PageHeaderComponent } from 'src/app/components/page-header/page-header.component';
import { ActivatedRoute } from '@angular/router';
import { ServiceService } from 'src/app/services/service.service';
import { addIcons } from 'ionicons';
import { arrowBack, briefcase, calendar, calendarOutline, cash, cashOutline, chatbubble, chatbubbleOutline, checkmark, checkmarkCircle, checkmarkOutline, chevronDown, chevronForward, chevronForwardOutline, chevronUp, close, closeCircle, construct, cube, documentText, downloadOutline, ellipsisVertical, expand, eye, eyeOutline, flame, folderOpen, grid, hammer, heart, heartOutline, imagesOutline, informationCircle, location, locationOutline, lockClosed, map, navigate, navigateOutline, peopleOutline, personOutline, pricetagOutline, refreshCircle, shareOutline, shareSocial, sparkles, star, starOutline, swapHorizontal, time, timeOutline, warning } from 'ionicons/icons';
import { LocationPickerComponent } from 'src/app/components/location-picker/location-picker.component';
import { ServiceRequestsService } from 'src/app/services/service-requests.service';
import { MakeOfferModalComponent } from 'src/app/components/make-offer-modal/make-offer-modal.component';
import { AuthService } from 'src/app/services/auth.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { Subscription } from 'rxjs';
import { OffersService } from 'src/app/services/offers.service';
import { UiEffectsService } from 'src/app/services/ui-effects.service';
import { FileSizePipe } from 'src/app/pipes/file-size-pipe';
import { TimeAgoPipe } from 'src/app/pipes/time-ago-pipe';
import { ModalCompleteWorkerComponent } from 'src/app/components/modal-complete-worker/modal-complete-worker.component';
import { ApproveDeliveryModalComponent } from 'src/app/components/approve-delivery-modal/approve-delivery-modal.component';
import { RejectModalComponent } from 'src/app/components/reject-modal/reject-modal.component';
import { RevisionModalComponent } from 'src/app/components/revision-modal/revision-modal.component';
import { ImageViewerComponent } from 'src/app/components/image-viewer/image-viewer.component';

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.page.html',
  styleUrls: ['./service-detail.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButtons,
    IonButton,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    CommonModule,
    FormsModule,
    IonIcon,
    DatePipe,
    DecimalPipe,
    LocationPickerComponent,
    FileSizePipe,
    TimeAgoPipe,
    PageHeaderComponent,
  ],
  providers: [
    CurrencyPipe
  ]
})
export class ServiceDetailPage implements OnInit, OnDestroy {

  // Propiedades de estado UI
  isScrolled = false;
  isLoading = true;
  parallaxOffset = 0;
  selectedImage = 0;
  descExpanded = false;
  isLongDescription = false;
  showShareTooltip = false;
  offerSort: 'price' | 'rating' = 'price';
  toastVisible = false;
  toastMessage = '';
  toastType: 'default' | 'success' | 'error' = 'default';
  toastIcon = 'information-circle';
  userColor = '#4f46e5';
  isCurrentUserWorker = false;
  isCurrentUserOwner = false;
  acceptedOffer: any = null;

  service: any = {};
  isFavorite = false;
  serviceId: number;
  currentUser: any;
  routeInfo: { distance: number; duration: number } | null = null;

  // Rating
  hasRated = false;
  rating = 0;
  ratingComment = '';
  userRating = 0;
  userRatingComment = '';

  // Inyecciones
  private route: ActivatedRoute = inject(ActivatedRoute);
  _service: ServiceService = inject(ServiceService);
  private _serviceRequests: ServiceRequestsService = inject(ServiceRequestsService);
  private authService: AuthService = inject(AuthService);
  private websocketService: WebsocketService = inject(WebsocketService);
  private wsSubscriptions: Subscription[] = [];
  private currencyPipe: CurrencyPipe = inject(CurrencyPipe);
  private _offerService: OffersService = inject(OffersService);
  private _ui: UiEffectsService = inject(UiEffectsService); // NUEVO

  constructor() {
    this.serviceId = +this.route.snapshot.paramMap.get('id')!;
    this.registerIcons();
  }

  private registerIcons() {
    addIcons({
      arrowBack, calendarOutline, cashOutline, chatbubble, chatbubbleOutline, checkmark,
      checkmarkOutline, chevronDown, chevronForward, chevronUp, close, closeCircle, construct,
      documentText, expand, eye, flame, folderOpen, grid, heart, heartOutline, location, map,
      navigate, personOutline, pricetagOutline, shareSocial, sparkles, star, time, timeOutline,
      downloadOutline, ellipsisVertical, swapHorizontal, lockClosed, briefcase, checkmarkCircle,
      navigateOutline, cash, informationCircle, calendar, locationOutline, hammer, warning, cube, refreshCircle, starOutline
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.serviceId) {
      this.loadServiceDetail();
      this.connectToRealtimeUpdates(this.serviceId);
    }
  }

  ngOnDestroy() {
    // Limpiar suscripciones
    this.wsSubscriptions.forEach(sub => sub.unsubscribe());

    // Dejar canales de WebSocket
    if (this.service?.id) {
      this.websocketService.leaveChannel(`service.${this.service.id}`);
    }
  }

  // ==========================================
  // EVENTOS DE SCROLL Y PARALLAX
  // ==========================================

  onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    this.isScrolled = scrollTop > 100;
    this.parallaxOffset = scrollTop * 0.5;
  }

  goBack() {
    this._ui.triggerHaptic('light');
    this._service.url('/home');
  }

  // ==========================================
  // GALERÍA DE IMÁGENES
  // ==========================================

  selectImage(index: number) {
    this._ui.triggerHaptic('light');
    this.selectedImage = index;
    // Aquí podrías abrir un modal de galería
  }

  // ==========================================
  // ACCIONES DE HEADER
  // ==========================================

  async shareService() {
    this._ui.triggerHaptic('medium');
    this.showShareTooltip = true;
    setTimeout(() => this.showShareTooltip = false, 2000);

    if (navigator.share) {
      try {
        await navigator.share({
          title: this.service.title,
          text: this.service.description,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    this._ui.triggerHaptic(this.isFavorite ? 'medium' : 'light');
    this.showToast(
      this.isFavorite ? 'Agregado a favoritos' : 'Eliminado de favoritos',
      this.isFavorite ? 'success' : 'default'
    );
  }

  showMoreOptions() {
    // Action sheet con más opciones
    console.log('More options');
  }

  // ==========================================
  // CARGA DE DATOS
  // ==========================================
  async loadServiceDetail() {
    this.isLoading = true;
    const loading = await this._service.presentLoading({ message: 'Cargando...' });
    await loading.present();
    try {
      const response = await this._serviceRequests.getRequest(this.serviceId);
      console.log(response);
      if (response.success) {
        this.service = response.data;
        this.isLongDescription = this.service.description?.length > 150;
        this.userColor = this.generateUserColor(this.service.user?.name);
        this.checkUserRole();

        // Animar entrada de elementos
        setTimeout(() => {
          this._ui.animateEntrance('.content-sheet > *', {
            duration: 600,
            delay: 100
          });
        }, 100);
      }
    } catch (error) {
      console.log(error);
    }
    this.isLoading = false;
    await loading.dismiss();
  }

  async handleRefresh(event: any) {
    await this.loadServiceDetail();
    event.target.complete();
  }

  private generateUserColor(name: string): string {
    if (!name) return '#4f46e5';
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  // ==========================================
  // CATEGORÍAS E ICONOS
  // ==========================================
  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'tecnología': 'laptop',
      'hogar': 'home',
      'limpieza': 'sparkles',
      'mudanza': 'cube',
      'jardinería': 'leaf',
      'clases': 'school',
      'mascotas': 'paw',
      'eventos': 'calendar',
      'salud': 'medical',
      'belleza': 'cut',
      'default': 'briefcase'
    };
    return icons[category?.toLowerCase()] || icons['default'];
  }

  filterByCategory(category: string) {
    this._ui.triggerHaptic('light');
    //this.router.navigate(['/home'], { queryParams: { category } });
  }

  connectToRealtimeUpdates(serviceId: number) {
    // Conectar WebSocket si no está conectado
    if (!this.websocketService.isConnected()) {
      this.websocketService.connect();
    }

    // Escuchar todos los eventos del servicio
    this.websocketService.listenToService(serviceId, (data) => {
      switch (data.type) {
        case 'created':
          this.handleNewOffer(data);
          break;
        case 'accepted':
          this.handleOfferAccepted(data);
          break;
        case 'rejected':
          this.handleOfferRejected(data);
          break;
      }
    });

    // Si el usuario está autenticado, escuchar sus notificaciones personales
    if (this.currentUser?.id) {
      this.websocketService.listenToUserNotifications(this.currentUser.id, (data) => {
        switch (data.type) {
          case 'accepted':
            this.showToast('🎉 ¡Tu oferta fue aceptada!', 'success');
            break;
          case 'rejected':
            this.showToast('Tu oferta fue rechazada', 'default');
            break;
        }
      });
    }
  }

  handleNewOffer(data: any) {
    // Agregar la nueva oferta a la lista si existe
    if (this.service) {
      if (!this.service.offers) {
        this.service.offers = [];
      }

      // Evitar duplicados
      const exists = this.service.offers.find((o: any) => o.id === data.offer.id);
      if (!exists) {
        this.service.offers.unshift(data.offer);
        this.service.offers_count = (this.service.offers_count || 0) + 1;
      }

      // Mostrar toast si el usuario es el dueño del servicio
      if (this.service.user_id === this.currentUser?.id) {
        this.showToast(
          `💰 ${data.offer.user.name} ofertó $${data.offer.price}`,
          'success',
        );
      }
    }
  }

  // Manejar oferta aceptada
  handleOfferAccepted(data: any) {
    // Actualizar la oferta aceptada en la lista
    const offerIndex = this.service.offers?.findIndex((o: any) => o.id === data.offer.id);
    if (offerIndex !== -1 && offerIndex !== undefined) {
      this.service.offers[offerIndex] = { ...this.service.offers[offerIndex], ...data.offer };
    }

    // Actualizar ofertas rechazadas
    data.rejected_offers?.forEach((id: number) => {
      const idx = this.service.offers?.findIndex((o: any) => o.id === id);
      if (idx !== -1 && idx !== undefined) {
        this.service.offers[idx].status = 'rejected';
      }
    });

    // Actualizar estado del servicio
    this.service.status = 'in_progress';

    // Mostrar mensaje según el rol
    if (this.currentUser?.id === data.offer.user.id) {
      // Soy el ofertante aceptado
      this.showToast('🎉 ¡Tu oferta fue aceptada! Puedes comenzar el trabajo', 'success');
    } else if (this.service.user_id === this.currentUser?.id) {
      // Soy el dueño que aceptó
      this.showToast(`Oferta de ${data.offer.user.name} aceptada`, 'success');
    } else {
      // Soy otro ofertante rechazado
      this.showToast('Esta oferta ya fue aceptada por otro usuario', 'default');
    }
  }

  // Manejar oferta rechazada
  handleOfferRejected(data: any) {
    const offerIndex = this.service.offers?.findIndex((o: any) => o.id === data.offer.id);
    if (offerIndex !== -1 && offerIndex !== undefined) {
      this.service.offers[offerIndex].status = 'rejected';
    }

    if (this.currentUser?.id === data.offer.user.id) {
      this.showToast('Tu oferta fue rechazada', 'default');
    }
  }

  handleUserNotification(data: any) {
    // Manejar diferentes tipos de notificaciones
    switch (data.type || 'offer.created') {
      case 'offer.created':
        this.showToast('Tu oferta fue enviada exitosamente', 'success');
        break;
      case 'offer.accepted':
        this.showToast('🎉 ¡Tu oferta fue aceptada!', 'success');
        break;
      case 'offer.rejected':
        this.showToast('Tu oferta fue rechazada', 'default');
        break;
    }
  }

  // ==========================================
  // ACCIONES DE FOOTER
  // ==========================================

  async makeOffer() {
    this._ui.triggerHaptic('medium');
    const modal = await this._service.openModal(MakeOfferModalComponent, {
      service: this.service
    }, {
      breakpoints: [0, 0.9, 1],
      initialBreakpoint: 1,
      cssClass: 'make-offer-modal'
    });
  }

  async contactUser() {
    this._ui.triggerHaptic('light');
    //this.router.navigate(['/chat', this.service.user_id]);
  }

  viewUserProfile(userId: number) {
    this._ui.triggerHaptic('light');
    //this.router.navigate(['/profile', userId]);
  }

  // ==========================================
  // TOAST PERSONALIZADO
  // ==========================================

  private showToast(message: string, type: 'default' | 'success' | 'error' = 'default') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastIcon = type === 'success' ? 'checkmark-circle' :
      type === 'error' ? 'close-circle' : 'information-circle';
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }

  formatPrice(price: number): string {
    return this.currencyPipe.transform(price, 'USD', 'symbol', '1.0-0') || '';
  }

  // ==========================================
  // DOCUMENTOS
  // ==========================================

  getDocIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'pdf': 'document-text',
      'image': 'image',
      'doc': 'document',
      'default': 'document-attach'
    };
    return icons[type] || icons['default'];
  }

  downloadDocument(doc: any) {
    this._ui.triggerHaptic('medium');
    console.log('Download:', doc);
  }

  // ==========================================
  // MAPA Y RUTA
  // ==========================================
  onRouteInfo(info: { distance: number, duration: number }) {
    console.log(`Distancia: ${info.distance}km, Tiempo: ${info.duration}min`);
    this.routeInfo = info;
    // Aquí puedes mostrar el costo estimado del domicilio, etc.
  }

  openFullMap() {
    // Abrir modal de mapa completo
    console.log('Open full map');
  }

  // ==========================================
  // OFERTAS
  // ==========================================

  get sortedOffers() {
    if (!this.service.offers) return [];
    return [...this.service.offers].sort((a, b) => {
      if (this.offerSort === 'price') {
        return a.price - b.price;
      }
      return (b.user?.rating || 0) - (a.user?.rating || 0);
    });
  }

  sortOffers(criteria: 'price' | 'rating') {
    this.offerSort = criteria;
    this._ui.triggerHaptic('light');
  }

  async acceptOffer(offer: any) {
    this._ui.triggerHaptic('heavy');
    const alert = await this._service.Alert({
      header: 'Aceptar oferta',
      message: `¿Aceptar la oferta de ${offer.user?.name} por ${this.formatPrice(offer.price)}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: async () => {
            try {
              const response = await this._offerService.saveAcceptOffer(offer.id, {});
              if (response.success) {
                offer.status = 'accepted';
                this.showToast('Oferta aceptada exitosamente', 'success');
                // Notificar por WebSocket
              }
            } catch (error) {
              console.log(error);
              this.showToast('Error al aceptar', 'default');
            }
            /* this.offerService.acceptOffer(offer.id).subscribe({
              next: (response) => {
                offer.status = 'accepted';
                this.showToast('Oferta aceptada exitosamente', 'success');
                // Notificar por WebSocket
              },
              error: (err) => {
                this.showToast(err.error?.message || 'Error al aceptar', 'danger');
              }
            }); */
          }
        }
      ]
    });
  }

  async rejectOffer(offer: any) {
    this._ui.triggerHaptic('medium');
    const alert = await this._service.Alert({
      header: 'Rechazar oferta',
      message: `¿Rechazar la oferta de ${offer.user?.name}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Rechazar',
          role: 'destructive',
          handler: () => {
            /* this.offerService.rejectOffer(offer.id).subscribe({
              next: (response) => {
                offer.status = 'rejected';
                this.showToast('Oferta rechazada', 'medium');
              },
              error: (err) => {
                this.showToast(err.error?.message || 'Error al rechazar', 'danger');
              }
            }); */
          }
        }
      ]
    });
  }

  private checkUserRole(): void {
    if (!this.currentUser || !this.service) return;

    this.isCurrentUserOwner = this.currentUser.id === this.service.user_id;

    // El worker es el usuario de la oferta aceptada
    this.acceptedOffer = this.service.offers?.find((o: any) => o.status === 'accepted');
    this.isCurrentUserWorker = this.acceptedOffer?.user_id === this.currentUser.id;
  }

  async chatWithWorker(): Promise<void> {
    await this._ui.triggerHaptic('light');
    // Navegar al chat con el worker
    // this._service.url(`/home/chat/${this.service.worker?.id}?service=${this.service.id}`);
  }

  openCompleteWorkModal(): void {
    this._ui.triggerHaptic('medium');
    //document.body.style.overflow = 'hidden';
    this._service.openModal(ModalCompleteWorkerComponent, {
      service: this.service,
      acceptedOffer: this.acceptedOffer
    }, { cssClass: 'complete-work-modal' });
  }

  reportIssue(): void {
    // Reportar problema con el servicio
    console.log('Report issue');
  }

  rateWorker(stars: number): void {
    this.rating = stars;
    this._ui.triggerHaptic('light');
  }

  async submitRating(): Promise<void> {
    if (!this.rating) return;

    try {
      /* await this._serviceRequests.rateWorker(this.service.id, {
        rating: this.rating,
        comment: this.ratingComment
      });
      
      this.hasRated = true;
      this.userRating = this.rating;
      this.userRatingComment = this.ratingComment; */
      this.showToast('¡Gracias por tu calificación!', 'success');
    } catch (error) {
      this.showToast('Error al enviar calificación', 'error');
    }
  }

  // Abrir visor de imagen
  openImageViewer(index: number): void {
    // Implementa con tu galería/modal de imágenes
    const images = this.service.service_requests_delivered?.evidence_images || [];
    this._service.openModal(ImageViewerComponent, { images, initialSlide: index }, { cssClass: 'image-viewer-modal' });
  }

  // Aprobar
  async openApproveModal() {
    const response = await this._service.openModal(ApproveDeliveryModalComponent, {
      deliveryId: this.service.service_requests_delivered.id,
      workerName: this.service.worker?.name,
      workerAvatar: this.service.worker?.avatar_url,
      completionNotes: this.service.service_requests_delivered?.completion_notes,
      actualHours: this.service.service_requests_delivered?.actual_hours
    }, {
      cssClass: 'approve-delivery-modal'
    });

    const { data } = response;
    console.log(data);
    if (data?.approved) await this.loadServiceDetail();
  }

  // Solicitar correcciones
  async openRevisionModal() {
    const response = await this._service.openModal(RevisionModalComponent, {
      deliveryId: this.service.service_requests_delivered.id,
      workerName: this.service.worker?.name,
      workerAvatar: this.service.worker?.avatar_url
    }, {
      cssClass: 'revision-modal'
    });

    const { data } = response;
    console.log(data);
    if (data?.approved) await this.loadServiceDetail();
  }

  // Rechazar
  async openRejectModal() {
    const response = await this._service.openModal(RejectModalComponent, {
      deliveryId: this.service.service_requests_delivered.id,
      workerName: this.service.worker?.name,
      workerAvatar: this.service.worker?.avatar_url
    }, {
      cssClass: 'reject-modal'
    });

    const { data } = response;
    console.log(data);
    if (data?.approved) await this.loadServiceDetail();
  }

}
