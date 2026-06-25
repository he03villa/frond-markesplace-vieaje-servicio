import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonRefresher, IonRefresherContent, IonSkeletonText, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { ServiceService } from 'src/app/services/service.service';
import { ActionSheetController } from '@ionic/angular';
import { RideItem, RideStats } from 'src/app/interface/my-rides';
import { addIcons } from 'ionicons';
import { addOutline, alertCircleOutline, arrowBackOutline, arrowDown, arrowForwardOutline, arrowUpOutline, calendarOutline, carOutline, cashOutline, checkmarkCircleOutline, chevronForwardOutline, closeOutline, createOutline, eyeOutline, flagOutline, locationOutline, navigateOutline, optionsOutline, pauseCircleOutline, peopleOutline, starOutline, timeOutline, trashOutline, trendingUpOutline } from 'ionicons/icons';
import { RidesService } from 'src/app/services/rides.service';

@Component({
  selector: 'app-my-rides',
  templateUrl: './my-rides.page.html',
  styleUrls: ['./my-rides.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, IonButtons, IonButton, IonIcon, IonRefresher, IonRefresherContent, IonSkeletonText, IonFab, IonFabButton]
})
export class MyRidesPage implements OnInit {
  private actionSheetCtrl = inject(ActionSheetController);
  private _services = inject(ServiceService);
  private _ridesService = inject(RidesService);

  headerSolid = false;
  activeTab: 'upcoming' | 'completed' | 'cancelled' | 'all' = 'all';

  isLoading = true;
  rides: RideItem[] = [];
  filteredRides: RideItem[] = [];

  stats: RideStats = {
    upcoming: 2,
    completed: 15,
    cancelled: 1,
    total_passengers: 48,
    total_earnings: 720,
    in_progress: 2,
    total: 30
  };

  constructor() {
    addIcons({
      carOutline, addOutline, calendarOutline, peopleOutline,
      cashOutline, locationOutline, timeOutline, arrowForwardOutline,
      closeOutline, createOutline, trashOutline, checkmarkCircleOutline,
      alertCircleOutline, pauseCircleOutline, eyeOutline, optionsOutline,
      navigateOutline, flagOutline, starOutline, trendingUpOutline,
      chevronForwardOutline, arrowBackOutline, arrowUpOutline, arrowDown
    });
  }

  ngOnInit() {
    this.loadRides();
  }

  onScroll(ev: any) {
    this.headerSolid = ev.detail.scrollTop > 80;
  }

  scrollToTop() {
    document.querySelector('ion-content')?.scrollToTop(500);
  }

  back() {
    this._services.url('/home');
  }

  async loadRides(reset = false) {
    if (reset) {
      this.isLoading = true;
      //this.currentPage = 1;
      this.rides = [];
      this.filteredRides = [];
    }

    try {
      const data = {
        status: this.activeTab,
        page: 1
      };
      const res = await this._ridesService.getMyRides(data);
      console.log(res);
      this.rides = res.data.rides;
      this.filteredRides = [...this.rides];
      this.stats = res.data.stats;
      this.isLoading = false;
    } catch (error) {
      console.log(error);
    }
  }

  async handleRefresh(ev: any) {
    await this.loadRides();
    ev.target.complete();
  }

  setTab(tab: 'upcoming' | 'completed' | 'cancelled' | 'all') {
    this.activeTab = tab;
    this.applyFilters();
  }

  applyFilters() {
    this.loadRides(true);
  }

  async openActions(ride: RideItem) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: `${ride.origin} → ${ride.destination}`,
      buttons: [
        {
          text: 'Ver detalle',
          icon: 'eye-outline',
          handler: () => this.viewRide(ride.publishable_id || 0)
        },
        {
          text: 'Editar',
          icon: 'create-outline',
          handler: () => this.editRide(ride.publishable_id || 0)
        },
        {
          text: ride.status === 'upcoming' ? 'Cancelar viaje' : 'Reactivar',
          icon: ride.status === 'upcoming' ? 'close-outline' : 'checkmark-circle-outline',
          role: ride.status === 'upcoming' ? 'destructive' : undefined,
          handler: () => this.toggleStatus(ride)
        },
        {
          text: 'Cerrar',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  viewRide(id: number) {
    this._services.url(`/home/${id}/ride-detail`);
  }

  editRide(id: number) {
    //this._services.url(`/home/${id}/edit-ride`);
  }

  async toggleStatus(ride: RideItem) {
    /* if (ride.status === 'upcoming') {
      ride.status = 'cancelled';
      ride.statusLabel = 'Cancelado';
      await this.showToast('Viaje cancelado', 'warning');
    } else {
      ride.status = 'upcoming';
      ride.statusLabel = 'Próximo';
      await this.showToast('Viaje reactivado', 'success');
    }
    //this.applyFilters(); */
  }

  createRide() {
    this._services.url('/create-ride');
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'upcoming': '#3b82f6',
      'completed': '#10b981',
      'cancelled': '#ef4444',
      'in-progress': '#f59e0b'
    };
    return colors[status] || '#64748b';
  }

  getOccupancyRate(ride: RideItem): number {
    return ((ride.seatsTotal - ride.seatsAvailable) / ride.seatsTotal) * 100;
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this._services.Toast({
      message, duration: 2500, position: 'bottom', color,
      buttons: [{ icon: 'close-outline', role: 'cancel' }]
    });
  }

}
