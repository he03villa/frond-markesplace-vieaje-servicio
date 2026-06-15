import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add, addCircleOutline, apps, arrowForward, bookmarkOutline, briefcase, car, carOutline,
  carSport, carSportOutline, cart, cartOutline, chatbubble, chatbubbleOutline, checkmark, checkmarkCircle,
  clipboardOutline, close, createOutline, documentText, documentTextOutline, eyeOutline,
  grid, handLeft, heartOutline, list, location, locationOutline, map, mapOutline, mic,
  navigate, notifications, notificationsOutline, options, people, peopleOutline, person,
  personCircle, personOutline, remove, searchOutline, settingsOutline, shareOutline,
  shareSocial, star, time, timeOutline, trashOutline, trendingUp
} from 'ionicons/icons';
import { ServiceService } from 'src/app/services/service.service';
import { ServiceRequestsService } from 'src/app/services/service-requests.service';
import { LocationService } from 'src/app/services/location.service';
import { PublicationsService } from 'src/app/services/publications.service';
import { UiEffectsService } from 'src/app/services/ui-effects.service';
import { MyAssignmentsService } from 'src/app/services/my-assignments.service';
import { Assignment } from 'src/app/interface/assignment';
import { RidesService } from 'src/app/services/rides.service';
import { AuthService } from 'src/app/services/auth.service';
import { ReviewsService } from 'src/app/services/reviews.service';
import { ModalCreateServicesRideComponent } from 'src/app/components/modal-create-services-ride/modal-create-services-ride.component';

@Component({
  selector: 'app-initiate',
  templateUrl: './initiate.page.html',
  styleUrls: ['./initiate.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, DecimalPipe]
})
export class InitiatePage implements OnInit {

  private _service: ServiceService = inject(ServiceService);
  private _serviceRequests: ServiceRequestsService = inject(ServiceRequestsService);
  private _riderService: RidesService = inject(RidesService);
  private _locationService: LocationService = inject(LocationService);
  private _publications: PublicationsService = inject(PublicationsService);
  private _ui: UiEffectsService = inject(UiEffectsService);
  private _myAssignments: MyAssignmentsService = inject(MyAssignmentsService);
  private authService: AuthService = inject(AuthService);
  private _reviewService: ReviewsService = inject(ReviewsService);

  // Datos principales
  summary: any;
  arrayServicesRequets: Array<any> = [];
  arrayRides: Array<any> = [];
  publications: Array<any> = [];

  // Tabs principales: 'services' | 'rides' | 'my-services'
  activeTab: string = 'services';

  // ==========================================
  // NUEVO: Sistema de "Mis Servicios"
  // ==========================================

  // Sub-tab activo: 'publications' | 'assignments'
  myServicesSubTab: string = 'publications'; // Por defecto muestra asignados

  // Filtro de asignaciones: 'all' | 'services' | 'driver' | 'passenger'
  assignmentFilter: string = 'all';

  // Contadores para badges
  activeAssignmentsCount: number = 0;
  activeServicesCount: number = 0;
  activeTripsCount: number = 0;
  myPublicationsCount: number = 0;

  // Datos de asignaciones (servicios donde el usuario está asignado)
  assignments: Assignment[] = [];

  // Filtros de publicaciones
  publicationFilter: string = 'all';
  currentUser: any;

  constructor() {
    addIcons({
      // Iconos existentes
      notificationsOutline, cartOutline, star, documentTextOutline, carOutline,
      addCircleOutline, searchOutline, carSportOutline, mapOutline, add,
      locationOutline, timeOutline, personOutline, peopleOutline, shareSocial,
      notifications, cart, settingsOutline, mic, options, documentText, trendingUp,
      carSport, remove, arrowForward, map, briefcase, grid, list, time, close,
      car, handLeft, location, bookmarkOutline, shareOutline, eyeOutline,
      chatbubbleOutline, createOutline, trashOutline, heartOutline,
      // NUEVOS iconos para "Mis Servicios"
      checkmark, checkmarkCircle, clipboardOutline, navigate, person, personCircle,
      chatbubble, people, apps
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.cargarUser();
    this.cargarsummary();
    this.cargarServices();
    //this.cargarAssignments(); // Cargar asignaciones al inicio
    setTimeout(() => this.initUIEffects(), 100);
  }

  ngOnDestroy() {
    this._ui.cleanupComponent('initiate-page');
  }

  public async cargarUser() {
    try {
      const response:any = await this.authService.me();
      console.log(response);
      if (response.success) {
        this.currentUser.count_reviews = response.data.count_reviews;
        this.currentUser.rating = response.data.rating;
      }
    } catch (error) {
      console.log(error);
    }
  }

  // ==========================================
  // INICIALIZACIÓN DE UI EFFECTS
  // ==========================================
  private initUIEffects(): void {
    // 1. Contadores animados
    this._ui.animateCounters('.counter', 1500);

    // 2. Tabs orbitales personalizados (actualizado para 3 tabs)
    this._ui.initOrbitalTabs(
      '.orbital-tab',
      '.tab-indicator',
      (event) => {
        console.log('Tab changed:', event);
        this.activeTab = event.tab;

        // Cargar datos según el tab
        if (event.tab === 'my-services') {
          if (this.assignments.length === 0) {
            this.cargarAssignments();
          }
          if (this.publications.length === 0) {
            this.cargarPublications();
          }
        }
      }
    );

    // 3. Efectos de scroll
    this._ui.initScrollEffects(
      '.floating-header',
      '.main-scroll',
      {
        hideThreshold: 100,
        blurThreshold: 50,
        parallaxElements: ['.mesh-blob']
      }
    );

    // 4. FAB Morphing
    this._ui.initMorphingFAB(
      '#main-fab',
      '.fab-menu',
      (action) => {
        console.log('FAB action:', action);
        if (action === 'service') {
          this.createServiceRequest();
        }
      }
    );

    // 5. Menú morphing
    this._ui.initMenuMorph('.menu-morph', (isOpen) => {
      console.log('Menu toggled:', isOpen);
    });

    // 6. Pull to refresh
    this._ui.initPullToRefresh('.main-scroll', async () => {
      await this.refreshData();
    });
  }

  // ==========================================
  // MÉTODOS DE CARGA DE DATOS
  // ==========================================

  async refreshData(): Promise<void> {
    await this.cargarServices();
    if (this.activeTab === 'my-services') {
      await Promise.all([
        //this.cargarAssignments(),
        this.cargarPublications()
      ]);
    } else if (this.activeTab === 'rides') {
      this.cargarRides();
    } else if (this.activeTab === 'services') {
      await this.cargarServices();
    }
  }

  async cargarReviews() {
    const loading = await this._service.presentLoading({ message: 'Cargando...' });
    await loading.present();
    try {
      const response: any = await this._reviewService.getUsersReviews(this.currentUser.id);
      console.log(response);
      if (response.success) {
        //this.summary = response.data.summary;
        setTimeout(() => {
          this._ui.animateEntrance('.service-tile', {
            duration: 600,
            delay: 100,
            from: { opacity: 0, y: 30, scale: 0.95 }
          });
        }, 100);
      }
    } catch (error) {
      console.log(error);
    }
    await loading.dismiss();
  }

  async cargarsummary() {
    const loading = await this._service.presentLoading({ message: 'Cargando...' });
    await loading.present();
    try {
      const response: any = await this._publications.getMyPublicationsSummary();
      console.log(response);
      if (response.success) {
        this.summary = response.data.summary;
        setTimeout(() => {
          this._ui.animateEntrance('.service-tile', {
            duration: 600,
            delay: 100,
            from: { opacity: 0, y: 30, scale: 0.95 }
          });
        }, 100);
      }
    } catch (error) {
      console.log(error);
    }
    await loading.dismiss();
  }

  async cargarServices() {
    const loading = await this._service.presentLoading({ message: 'Cargando...' });
    await loading.present();
    try {
      const location = await this._locationService.getCurrentPosition();
      let data;
      if (location != null) {
        data = { lat: location.lat, lng: location.lng };
      }
      const response: any = await this._serviceRequests.getAllRequests(data);
      console.log(response);
      if (response.success) {
        this.arrayServicesRequets = response.data.data;
        setTimeout(() => {
          this._ui.animateEntrance('.service-tile', {
            duration: 600,
            delay: 100,
            from: { opacity: 0, y: 30, scale: 0.95 }
          });
        }, 100);
      }
    } catch (error) {
      console.log(error);
    }
    await loading.dismiss();
  }

  // ==========================================
  // NUEVO: Cargar asignaciones (servicios donde estoy asignado)
  // ==========================================
  async cargarAssignments(): Promise<void> {
    const loading = await this._service.presentLoading({ message: 'Cargando asignaciones...' });
    await loading.present();
    try {
      const response: any = await this._myAssignments.getMyAssignments();
      console.log('Assignments:', response);
      if (response.success) {
        // Mapear respuesta del backend al formato del frontend
        this.assignments = response.data.data.assignments.map((item: any) => ({
          id: item.id,
          type: item.type, // 'service' | 'trip'
          role: item.role, // 'worker' | 'driver' | 'passenger'
          status: item.status, // 'pending' | 'active' | 'completed'
          title: item.title,
          description: item.description,
          price: item.price,
          createdAt: new Date(item.created_at),

          // Servicio específico
          address: item.address,
          deadline: item.deadline ? new Date(item.deadline) : undefined,

          // Viaje específico
          origin: item.origin,
          destination: item.destination,
          departureTime: item.departure_time ? new Date(item.departure_time) : undefined,
          passengersCount: item.passengers_count,
          driverName: item.driver?.name,
          seatsReserved: item.seats_reserved,

          // UI metadata del backend
          ui: item.ui
        }));

        // Actualizar contadores desde el backend
        this.activeServicesCount = response.data.data.counts.services_active;
        this.activeTripsCount = response.data.data.counts.trips_as_driver + response.data.data.counts.trips_as_passenger;
        this.activeAssignmentsCount = response.data.data.counts.total_active;
        // Actualizar contadores
        this.updateAssignmentCounts();
  
        // Animar entrada
        setTimeout(() => {
          this._ui.animateEntrance('.assignment-card', {
            duration: 500,
            delay: 80,
            from: { opacity: 0, y: -20 }
          });
        }, 100);
      }
    } catch (error) {
      console.error('Error cargando asignaciones:', error);
      this._service.presentToast('Error al cargar asignaciones', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  // ==========================================
  // Cargar publicaciones (ya existente, adaptado)
  // ==========================================
  async cargarPublications(): Promise<void> {
    const loading = await this._service.presentLoading({ message: 'Cargando...' });
    await loading.present();
    try {
      const response: any = await this._publications.getMyPublications();
      console.log(response);
      if (response.success) {
        this.publications = response.data.data || [];
        this.myPublicationsCount = this.publications.length;

        setTimeout(() => {
          this._ui.animateEntrance('.pub-card', {
            duration: 500,
            delay: 50
          });
        }, 100);
      }
    } catch (error) {
      console.log(error);
    }
    await loading.dismiss();
  }

  async cargarRides() {
    const loading = await this._service.presentLoading({ message: 'Cargando...' });
    await loading.present();
    try {
      const location = await this._locationService.getCurrentPosition();
      let data;
      if (location != null) {
        data = { lat: location.lat, lng: location.lng };
      }
      const response: any = await this._riderService.getAllRides(data);
      console.log(response);
      if (response.success) {
        this.arrayRides = response.data.data || [];
        //this.myPublicationsCount = this.publications.length;

        setTimeout(() => {
          this._ui.animateEntrance('.pub-card', {
            duration: 500,
            delay: 50
          });
        }, 100);
      }
    } catch (error) {
      console.log(error);
    }
    await loading.dismiss();
  }

  async cargarAssignmentsService(): Promise<void> {
    const loading = await this._service.presentLoading({ message: 'Cargando asignaciones...' });
    await loading.present();
    try {
      const response: any = await this._myAssignments.getMyServicesAsWorker();
      console.log('Assignments:', response);
      if (response.success) {
        // Mapear respuesta del backend al formato del frontend
        this.assignments = response.data.data.map((item: any) => ({
          id: item.id,
          type: item.type, // 'service' | 'trip'
          role: item.role, // 'worker' | 'driver' | 'passenger'
          status: item.status, // 'pending' | 'active' | 'completed'
          title: item.title,
          description: item.description,
          price: item.price,
          createdAt: new Date(item.created_at),

          // Servicio específico
          address: item.address,
          deadline: item.deadline ? new Date(item.deadline) : undefined,

          // Viaje específico
          origin: item.origin,
          destination: item.destination,
          departureTime: item.departure_time ? new Date(item.departure_time) : undefined,
          passengersCount: item.passengers_count,
          driverName: item.driver?.name,
          seatsReserved: item.seats_reserved,

          // UI metadata del backend
          ui: item.ui
        }));
  
        // Animar entrada
        setTimeout(() => {
          this._ui.animateEntrance('.assignment-card', {
            duration: 500,
            delay: 80,
            from: { opacity: 0, y: -20 }
          });
        }, 100);
      }
    } catch (error) {
      console.error('Error cargando asignaciones:', error);
      this._service.presentToast('Error al cargar asignaciones', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async cargarAssignmentsDriver(): Promise<void> {
    const loading = await this._service.presentLoading({ message: 'Cargando asignaciones...' });
    await loading.present();
    try {
      const response: any = await this._myAssignments.getMyRidesAsDriver();
      console.log('Assignments:', response);
      if (response.success) {
        // Mapear respuesta del backend al formato del frontend
        this.assignments = response.data.data.map((item: any) => ({
          id: item.id,
          type: item.type, // 'service' | 'trip'
          role: item.role, // 'worker' | 'driver' | 'passenger'
          status: item.status, // 'pending' | 'active' | 'completed'
          title: item.title,
          description: item.description,
          price: item.price,
          createdAt: new Date(item.created_at),

          // Servicio específico
          address: item.address,
          deadline: item.deadline ? new Date(item.deadline) : undefined,

          // Viaje específico
          origin: item.origin,
          destination: item.destination,
          departureTime: item.departure_time ? new Date(item.departure_time) : undefined,
          passengersCount: item.passengers_count,
          driverName: item.driver?.name,
          seatsReserved: item.seats_reserved,

          // UI metadata del backend
          ui: item.ui
        }));
  
        // Animar entrada
        setTimeout(() => {
          this._ui.animateEntrance('.assignment-card', {
            duration: 500,
            delay: 80,
            from: { opacity: 0, y: -20 }
          });
        }, 100);
      }
    } catch (error) {
      console.error('Error cargando asignaciones:', error);
      this._service.presentToast('Error al cargar asignaciones', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async cargarAssignmentsPassenger(): Promise<void> {
    const loading = await this._service.presentLoading({ message: 'Cargando asignaciones...' });
    await loading.present();
    try {
      const response: any = await this._myAssignments.getMyRidesAsPassenger();
      console.log('Assignments:', response);
      if (response.success) {
        // Mapear respuesta del backend al formato del frontend
        this.assignments = response.data.data.map((item: any) => ({
          id: item.id,
          type: item.type, // 'service' | 'trip'
          role: item.role, // 'worker' | 'driver' | 'passenger'
          status: item.status, // 'pending' | 'active' | 'completed'
          title: item.title,
          description: item.description,
          price: item.price,
          createdAt: new Date(item.created_at),

          // Servicio específico
          address: item.address,
          deadline: item.deadline ? new Date(item.deadline) : undefined,

          // Viaje específico
          origin: item.origin,
          destination: item.destination,
          departureTime: item.departure_time ? new Date(item.departure_time) : undefined,
          passengersCount: item.passengers_count,
          driverName: item.driver?.name,
          seatsReserved: item.seats_reserved,

          // UI metadata del backend
          ui: item.ui
        }));
  
        // Animar entrada
        setTimeout(() => {
          this._ui.animateEntrance('.assignment-card', {
            duration: 500,
            delay: 80,
            from: { opacity: 0, y: -20 }
          });
        }, 100);
      }
    } catch (error) {
      console.error('Error cargando asignaciones:', error);
      this._service.presentToast('Error al cargar asignaciones', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  // ==========================================
  // MÉTODOS DE FILTRADO Y UTILIDADES
  // ==========================================

  // Actualizar contadores de asignaciones
  private updateAssignmentCounts(): void {
    this.activeServicesCount = this.assignments.filter(
      a => a.type === 'service' && a.status === 'active'
    ).length;

    this.activeTripsCount = this.assignments.filter(
      a => a.type === 'trip' && a.status === 'active'
    ).length;

    this.activeAssignmentsCount = this.assignments.filter(
      a => a.status === 'active' || a.status === 'pending'
    ).length;
  }

  // Getter: Asignaciones filtradas según el filtro seleccionado
  get filteredAssignments(): Assignment[] {
    return this.assignments.filter(a => {
      if (this.assignmentFilter === 'all') return true;
      if (this.assignmentFilter === 'services') return a.type === 'service';
      if (this.assignmentFilter === 'driver') return a.type === 'trip' && a.role === 'driver';
      if (this.assignmentFilter === 'passenger') return a.type === 'trip' && a.role === 'passenger';
      return true;
    });
  }

  // Getter: Publicaciones filtradas
  get filteredPublications(): any[] {
    if (this.publicationFilter === 'all') return this.publications;
    return this.publications.filter(p => p.type === this.publicationFilter);
  }

  // ==========================================
  // MÉTODOS DE INTERACCIÓN DE UI
  // ==========================================

  async switchTab(tab: string): Promise<void> {
    console.log('Switching tab:', tab);
    await this._ui.triggerHaptic('light');
    this.activeTab = tab;

    // Actualizar UI de tabs
    document.querySelectorAll('.orbital-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-tab') === tab);
    });

    // Cargar datos si es necesario
    if (tab === 'my-services') {
      //if (this.assignments.length === 0) await this.cargarAssignments();
      if (this.publications.length === 0) await this.cargarPublications();
    } else if (tab === 'services') {
      await this.cargarServices();
    } else if (tab === 'rides') {
      await this.cargarRides();
    }
  }

  // Cambiar sub-tab en "Mis Servicios"
  async switchMyServicesSubTab(subTab: 'publications' | 'assignments'): Promise<void> {
    await this._ui.triggerHaptic('light');
    this.myServicesSubTab = subTab;

    // Animar transición
    this._ui.animateEntrance('.sub-panel', {
      duration: 300,
      from: { opacity: 0, y: 10 }
    });
  }

  // Cambiar filtro de asignaciones
  async setAssignmentFilter(filter: 'all' | 'services' | 'driver' | 'passenger'): Promise<void> {
    await this._ui.triggerHaptic('light');
    this.assignmentFilter = filter;

    // Feedback visual
    this._ui.pulseElement('.assignments-list');
  }

  // Cambiar filtro de publicaciones (existente, mejorado)
  async filterPublications(type: string): Promise<void> {
    await this._ui.triggerHaptic('light');
    this.publicationFilter = type;

    // Actualizar UI de filtros
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.classList.remove('active');
      const chipText = chip.textContent?.toLowerCase() || '';
      if (type === 'all' && chipText.includes('todas')) {
        chip.classList.add('active');
      } else if (type === 'service' && chipText.includes('servicios')) {
        chip.classList.add('active');
      } else if (type === 'ride' && chipText.includes('viajes')) {
        chip.classList.add('active');
      }
    });
  }

  // ==========================================
  // ACCIONES SOBRE ASIGNACIONES
  // ==========================================

  async openAssignmentDetail(assignment: Assignment): Promise<void> {
    await this._ui.triggerHaptic('light');
    this._ui.pulseElement(`[data-assignment-id="${assignment.id}"]`);

    // Navegar según tipo
    if (assignment.type === 'service') {
      this._service.url(`/home/${assignment.id}/service-detail`);
    } else {
      this.viewRide(parseInt(assignment.id));
    }
  }

  async acceptAssignment(assignment: Assignment): Promise<void> {
    await this._ui.triggerHaptic('medium');

    // Confirmar
    const alert = await this._service.Alert({
      header: '¿Aceptar servicio?',
      message: `¿Deseas aceptar: "${assignment.title}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Aceptar',
          handler: async () => {
            // Llamada al backend
            // await this._serviceRequests.acceptAssignment(assignment.id);

            // Actualizar local
            assignment.status = 'active';
            this.updateAssignmentCounts();

            // Feedback
            this._service.Toast({
              message: '¡Servicio aceptado!',
              color: 'success',
              duration: 2000
            });
          }
        }
      ]
    });
  }

  async openChat(assignment: Assignment): Promise<void> {
    await this._ui.triggerHaptic('light');
    this._service.url(`/home/chat/${assignment.id}`);
  }

  async completeAssignment(assignment: Assignment): Promise<void> {
    await this._ui.triggerHaptic('medium');

    // Marcar como completado
    assignment.status = 'completed';
    this.updateAssignmentCounts();

    // Animar salida
    const card = document.querySelector(`[data-assignment-id="${assignment.id}"]`);
    if (card) {
      await this._ui.animateEntrance(`[data-assignment-id="${assignment.id}"]`, {
        duration: 300,
        from: { opacity: 1, scale: 1 }
      });
    }

    this._service.Toast({
      message: 'Servicio completado',
      color: 'success',
      duration: 2000
    });
  }

  // ==========================================
  // ACCIONES SOBRE PUBLICACIONES (existentes)
  // ==========================================

  async editPublication(item: any): Promise<void> {
    await this._ui.triggerHaptic('light');
    console.log('Editing:', item);
    this._service.url(`/home/edit/${item.id}`);
  }

  async deletePublication(item: any): Promise<void> {
    await this._ui.triggerHaptic('medium');

    const confirmed = await this._service.Alert({
      header: '¿Eliminar publicación?',
      message: `¿Estás seguro de que deseas eliminar "${item.title}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            // Animación de salida
            const card = document.querySelector(`[data-pub-id="${item.id}"]`);
            if (card) {
              card.classList.add('deleting');
              await this._ui.animateEntrance(`[data-pub-id="${item.id}"]`, {
                duration: 300,
                from: { opacity: 1, y: 0 }
              });
            }

            // Eliminar lógicamente
            this.publications = this.publications.filter(p => p.id !== item.id);
            this.myPublicationsCount = this.publications.length;

            this._service.Toast({
              message: 'Publicación eliminada',
              color: 'danger',
              duration: 2000
            });
          },
        }
      ]
    });
  }

  // ==========================================
  // OTRAS ACCIONES
  // ==========================================

  viewService(id: number) {
    console.log(id);
    this._ui.triggerHaptic('light');
    this._ui.pulseElement(`[data-service-id="${id}"]`);
    this._service.url(`/home/${id}/service-detail`);
  }

  viewRide(id: number) {
    this._ui.triggerHaptic('light');
    this._ui.pulseElement(`[data-ride-id="${id}"]`);
    this._service.url(`/home/${id}/ride-detail`);
  }


  async createServiceRequest(type: 'service' | 'ride' = 'service'): Promise<void> {
    await this._ui.triggerHaptic('medium');
    await this._ui.pulseElement('.btn-add');
    this._service.openModal(ModalCreateServicesRideComponent, { type }, {});
  }

  async searchServices(type: 'service' | 'ride' = 'service'): Promise<void> {
    await this._ui.triggerHaptic('medium');
    // Abrir modal o navegar a creación
    sessionStorage.setItem('searchType', type);
    this._service.url('/home/search');
  }

  async createPublication() {
    await this._ui.triggerHaptic('medium');
    // Abrir modal o navegar a creación
    this._service.url('/home/create');
  }

  // Helpers para templates
  getAssignmentIcon(assignment: Assignment): string {
    if (assignment.type === 'service') return 'briefcase';
    if (assignment.role === 'driver') return 'car';
    return 'person';
  }

  getAssignmentTypeLabel(assignment: Assignment): string {
    if (assignment.type === 'service') return 'Servicio';
    if (assignment.role === 'driver') return 'Conductor';
    return 'Pasajero';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'active': 'En curso',
      'completed': 'Completado',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'warning',
      'active': 'success',
      'completed': 'medium',
      'cancelled': 'danger'
    };
    return colors[status] || 'medium';
  }
}