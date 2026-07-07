import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonButton,
  IonButtons, IonRefresher, IonRefresherContent, IonSkeletonText, IonFab, IonFabButton,
  IonModal
} from '@ionic/angular/standalone';
import { PageHeaderComponent } from 'src/app/components/page-header/page-header.component';
import { addIcons } from 'ionicons';
import { addOutline, alertCircleOutline, arrowBackOutline, arrowDown, arrowUpOutline, briefcaseOutline, calendarOutline, cashOutline, checkmarkCircleOutline, chevronForwardOutline, closeOutline, createOutline, documentTextOutline, eyeOutline, filterOutline, imageOutline, locationOutline, optionsOutline, pauseCircleOutline, peopleOutline, playOutline, searchOutline, star, starOutline, timeOutline, trashOutline, trendingUpOutline } from 'ionicons/icons';
import { ServiceService } from 'src/app/services/service.service';
import { ActionSheetController } from '@ionic/angular';
import { ServiceRequestsService } from 'src/app/services/service-requests.service';
import { ServiceItem, ServiceStats } from 'src/app/interface/my-services';
import { ModalCreateServicesRideComponent } from 'src/app/components/modal-create-services-ride/modal-create-services-ride.component';

@Component({
  selector: 'app-my-services',
  templateUrl: './my-services.page.html',
  styleUrls: ['./my-services.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonIcon, IonButton,
    IonButtons, IonRefresher, IonRefresherContent,
    IonSkeletonText, IonFab, IonFabButton,
    IonModal, PageHeaderComponent
  ]
})
export class MyServicesPage implements OnInit {
  _services: ServiceService = inject(ServiceService);
  private actionSheetCtrl = inject(ActionSheetController);
  private _ServiceRequest = inject(ServiceRequestsService);
  private _location: Location = inject(Location);

  // Header
  headerSolid = false;

  // Tabs
  activeTab: 'active' | 'completed' | 'paused' | 'all' = 'all';

  // Search
  searchQuery = '';
  showSearch = false;

  // Data
  isLoading = true;
  hasError = false;
  services: ServiceItem[] = [];
  filteredServices: ServiceItem[] = [];

  // Stats
  stats: ServiceStats = {
    active: 0,
    completed: 0,
    paused: 0,
    total_earnings: 0,
    total_views: 0,
    totalOffers: 0,
    total: 0
  };

  // Filter modal
  filterCategory = 'all';
  filterSort = 'recent';
  showFilterModal = false;

  constructor() {
    addIcons({
      briefcaseOutline, addOutline, filterOutline, searchOutline,
      closeOutline, eyeOutline, peopleOutline, cashOutline, timeOutline,
      checkmarkCircleOutline, alertCircleOutline, pauseCircleOutline,
      trashOutline, createOutline, arrowUpOutline, calendarOutline,
      locationOutline, starOutline, trendingUpOutline, optionsOutline,
      chevronForwardOutline, imageOutline, documentTextOutline, playOutline, star,
      arrowBackOutline, arrowDown
    });
  }

  ngOnInit() {
    this.loadServices(true);
  }

  // ============ SCROLL ============

  onScroll(ev: any) {
    this.headerSolid = ev.detail.scrollTop > 80;
  }

  scrollToTop() {
    document.querySelector('ion-content')?.scrollToTop(500);
  }

  back() {
    this._location.back();
  }

  // ============ LOAD ============

  async loadServices(reset = false) {
    if (reset) {
      this.isLoading = true;
      //this.currentPage = 1;
      this.services = [];
      this.filteredServices = [];
    }

    try {
      const data = {
        status: this.activeTab,
        page: 1
      };
      const response = await this._ServiceRequest.getMyRequests(data);
      console.log(response);
      if (response.success) {
        this.services = response.data.services || [];
        this.filteredServices = response.data.services || [];
        this.stats = response.data.stats;
        console.log(this.services);
      }
    } catch (error) {
      this.hasError = true;
    }
    this.isLoading = false;

    // Simular carga - reemplazar con tu servicio
    /* setTimeout(() => {
      this.applyFilters();
    }, 600); */
  }

  async handleRefresh(ev: any) {
    await this.loadServices();
    ev.target.complete();
  }

  // ============ FILTERS ============

  setTab(tab: 'active' | 'completed' | 'paused' | 'all') {
    this.activeTab = tab;
    this.applyFilters();
  }

  applyFilters() {
    this.loadServices(true);
  }

  // ============ ACTIONS ============

  async openActions(service: ServiceItem) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: service.title,
      buttons: [
        {
          text: 'Editar',
          icon: 'create-outline',
          handler: () => this.editService(service.id)
        },
        {
          text: service.status === 'paused' ? 'Reactivar' : 'Pausar',
          icon: service.status === 'paused' ? 'play-outline' : 'pause-circle-outline',
          handler: () => this.togglePause(service)
        },
        {
          text: 'Ver publicación',
          icon: 'eye-outline',
          handler: () => this.viewService(service.id)
        },
        {
          text: 'Eliminar',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => this.deleteService(service)
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  editService(id: number) {
    const url = `/home/${id}/edit-service`;
    this._services.url(url);
  }

  viewService(id: number) {
    console.log(id);
    const url = `/home/${id}/service-detail`;
    this._services.url(url);
  }

  async togglePause(service: ServiceItem) {
    service.status = service.status === 'paused' ? 'active' : 'paused';
    service.status_label = service.status === 'paused' ? 'Pausado' : 'Activo';
    await this.showToast(
      service.status === 'paused' ? 'Servicio pausado' : 'Servicio reactivado',
      'success'
    );
    this.applyFilters();
  }

  async deleteService(service: ServiceItem) {
    this.services = this.services.filter(s => s.id !== service.id);
    this.applyFilters();
    await this.showToast('Servicio eliminado', 'success');
  }

  createService() {
    //this._services.url('/create-service');
    const type = 'service';
    this._services.openModal(ModalCreateServicesRideComponent, { type }, {});
  }

  // ============ HELPERS ============

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'active': '#10b981',
      'completed': '#6366f1',
      'paused': '#f59e0b',
      'pending': '#64748b'
    };
    return colors[status] || '#64748b';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'active': 'checkmark-circle-outline',
      'completed': 'checkmark-circle-outline',
      'paused': 'pause-circle-outline',
      'pending': 'time-outline'
    };
    return icons[status] || 'alert-circle-outline';
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this._services.Toast({
      message, duration: 2500, position: 'bottom', color,
      buttons: [{ icon: 'close-outline', role: 'cancel' }]
    });
  }

}
