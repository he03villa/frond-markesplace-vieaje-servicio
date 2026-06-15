import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
  IonButton, IonIcon,
  IonModal, IonRefresher, IonRefresherContent, IonInfiniteScroll,
  IonInfiniteScrollContent, IonSkeletonText
} from '@ionic/angular/standalone';
import {
  mapOutline, filterOutline, searchOutline, gridOutline, listOutline,
  waterOutline, flashOutline, carOutline, schoolOutline, colorPaletteOutline,
  sparklesOutline, constructOutline, pawOutline, leafOutline, locationOutline,
  star, closeOutline, timeOutline, cashOutline, peopleOutline, eyeOutline,
  navigateOutline, calendarOutline, alarmOutline, checkmarkCircleOutline,
  trendingUpOutline, optionsOutline, arrowUpOutline, trailSignOutline,
  cardOutline, personOutline, carSportOutline,
  arrowDown,
  alertCircleOutline,
  arrowBackOutline
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ServiceService } from 'src/app/services/service.service';
import { PublicationsService } from 'src/app/services/publications.service';
import { Publication } from 'src/app/interface/publication';
import { Pagination } from 'src/app/interface/pagination';
import { ExploreFilters } from 'src/app/interface/explore-filters';
import { LocationService } from 'src/app/services/location.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
    IonButton, IonIcon,
    IonModal, IonRefresher, IonRefresherContent, IonInfiniteScroll,
    IonInfiniteScrollContent, IonSkeletonText,
  ]
})
export class SearchPage implements OnInit {
  @ViewChild('modal') modal!: IonModal;

  _service: ServiceService = inject(ServiceService);
  private _publications: PublicationsService = inject(PublicationsService);
  private _locationService: LocationService = inject(LocationService);

  // Datos
  publications: Publication[] = [];
  pagination: Pagination | null = null;

  map!: L.Map;
  mapMarkers: L.Marker[] = [];
  mapInitialized = false;

  // UI State
  currentView: 'grid' | 'list' | 'map' = 'grid';
  isMapView = false;
  isLoading = false;      // Primera carga
  isLoadingMore = false;  // Infinite scroll
  hasError = false;
  searchQuery = '';
  activeFiltersCount = 0;
  showHeaderShadow = false;

  // Filtros
  filters: ExploreFilters = {
    search: '',
    category: null,
    sort: null,
    type: null,
    max_distance: null,
    max_price: null,
    availability: null,
    page: 1,
    lat: null,
    lng: null
  };

  // Categorías
  categories = [
    { id: 'all', name: 'Todos', icon: 'grid-outline', active: true },
    { id: 'service', name: 'Servicios', icon: 'construct-outline', active: false },
    { id: 'ride', name: 'Viajes', icon: 'car-outline', active: false }
  ];

  // Filtros del modal
  tempFilters = { ...this.filters };

  constructor() {
    addIcons({
      mapOutline, filterOutline, searchOutline, gridOutline, listOutline,
      waterOutline, flashOutline, carOutline, schoolOutline, colorPaletteOutline,
      sparklesOutline, constructOutline, pawOutline, leafOutline, locationOutline,
      star, closeOutline, timeOutline, cashOutline, peopleOutline, eyeOutline,
      navigateOutline, calendarOutline, alarmOutline, checkmarkCircleOutline,
      trendingUpOutline, optionsOutline, arrowUpOutline, trailSignOutline,
      cardOutline, personOutline, carSportOutline, arrowDown, alertCircleOutline, arrowBackOutline
    });
  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    const searchType = sessionStorage.getItem('searchType');
    console.log(searchType);
    if (!searchType) {
      this.removeFilter('category');
      this.loadPublications();
    } else {
      sessionStorage.removeItem('searchType');
      this.selectCategory(searchType as 'service' | 'ride');
    }
  }

  // ==================== SCROLL & UI ====================

  onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    this.showHeaderShadow = scrollTop > 20;
  }

  scrollToTop() {
    document.querySelector('ion-content')?.scrollToTop(500);
  }

  back(): void {
    history.back();
  }

  // ==================== CARGA DE DATOS ====================

  async loadPublications(reset = true) {
    if (reset) {
      this.isLoading = true;
      this.filters.page = 1;
      this.publications = [];
      this.hasError = false;
    } else {
      this.isLoadingMore = true;
    }

    try {
      if (this.filters.sort === 'distance') {
        const location = await this._locationService.getCurrentPosition();
        this.filters.lat = location?.lat as number;
        this.filters.lng = location?.lng as number;
      }
      const response: any = await this._publications.getMyPublicationsExplore(this.filters);

      if (response?.success) {
        const newPublications: Publication[] = response.data.publications || [];

        if (reset) {
          this.publications = newPublications;
        } else {
          this.publications = [...this.publications, ...newPublications];
        }

        this.pagination = response.data.pagination || null;
        this.updateActiveFiltersCount();
      }
    } catch (error) {
      console.error(error);
      if (reset) this.hasError = true;
    } finally {
      this.isLoading = false;
      this.isLoadingMore = false;
    }
  }

  async handleRefresh(event: any) {
    await this.loadPublications(true);
    event.target.complete();
  }

  async loadMore(event: any) {
    if (this.pagination?.has_more_pages) {
      this.filters.page++;
      await this.loadPublications(false);
    }
    event.target.complete();

    // Deshabilitar infinite scroll si no hay más páginas
    if (!this.pagination?.has_more_pages) {
      event.target.disabled = true;
    }
  }

  // ==================== BÚSQUEDA ====================

  handleSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.filters.search = this.searchQuery;
    this.debounceLoad();
  }

  clearSearch() {
    this.searchQuery = '';
    this.filters.search = '';
    this.loadPublications(true);
  }

  private searchTimeout: any;
  debounceLoad() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadPublications(true);
    }, 400);
  }

  // ==================== CATEGORÍAS ====================

  selectCategory(categoryId: string) {
    this.categories = this.categories.map(c => ({
      ...c,
      active: c.id === categoryId
    }));

    this.filters.category = categoryId === 'all' ? null : categoryId;
    this.loadPublications(true);
  }

  // ==================== VISTAS ====================

  setView(view: 'grid' | 'list') {
    this.currentView = view;
    this.isMapView = false;
  }

  toggleMapView() {
    this.isMapView = !this.isMapView;
    if (this.isMapView) {
      setTimeout(() => {
        this.initMap();
      }, 100);
    } else {
      // Destruir mapa al salir para liberar recursos
      if (this.map) {
        this.map.remove();
        this.mapInitialized = false;
      }
    }
  }

  // ==================== FILTROS MODAL ====================

  openFilterModal() {
    this.tempFilters = { ...this.filters };
    this.tempFilters.sort = 'distance';
    this.modal.present();
  }

  closeFilterModal() {
    this.modal.dismiss();
  }

  async applyFilters() {
    this.filters = { ...this.tempFilters, page: 1 };
    this.loadPublications(true);
    this.modal.dismiss();
  }

  clearAllFilters() {
    this.categories[0].active = true;
    const post = this.categories.findIndex(c => c.id === this.filters.category);
    if (post !== -1) this.categories[post].active = false;
    this.tempFilters = {
      search: this.searchQuery,
      category: null,
      sort: null,
      type: null,
      max_distance: null,
      max_price: null,
      availability: null,
      page: 1,
      lat: null,
      lng: null
    };
  }

  toggleFilterType(type: string, value: string) {
    if (type === 'type') this.tempFilters.type = value === 'all' ? null : value;
    if (type === 'sort') this.tempFilters.sort = value;
    if (type === 'availability') this.tempFilters.availability = value === 'all' ? null : value;
  }

  updateDistanceValue(event: Event) {
    const target = event.target as HTMLInputElement;
    this.tempFilters.max_distance = parseInt(target.value);
  }

  updatePriceValue(event: Event) {
    const target = event.target as HTMLInputElement;
    this.tempFilters.max_price = parseInt(target.value);
  }

  isFilterActive(type: string, value: string): boolean {
    if (type === 'type') {
      if (value === 'all') return !this.tempFilters.type;
      return this.tempFilters.type === value;
    }
    if (type === 'sort') return this.tempFilters.sort === value;
    if (type === 'availability') {
      if (value === 'all') return !this.tempFilters.availability;
      return this.tempFilters.availability === value;
    }
    return false;
  }

  removeFilter(key: keyof ExploreFilters) {
    if (key === 'search') {
      this.searchQuery = '';
      this.filters.search = '';
    } else if (key === 'category') {
      this.filters.category = null;
      this.selectCategory('all');
      return; // ya recarga
    } else if (key === 'type') {
      this.filters.type = null;
    } else if (key === 'availability') {
      this.filters.availability = null;
    } else if (key === 'sort') {
      this.filters.sort = null;
    }
    this.loadPublications(true);
  }

  updateActiveFiltersCount() {
    let count = 0;
    if (this.filters.search) count++;
    if (this.filters.category) count++;
    if (this.filters.type) count++;
    if (this.filters.availability) count++;
    if (this.filters.sort !== '' && this.filters.sort !== null) count++;
    if (this.filters.max_distance) count++;
    if (this.filters.max_price) count++;
    this.activeFiltersCount = count;
  }

  // ==================== HELPERS ====================

  getRatingColor(rating: number): string {
    if (rating >= 4.5) return '#10b981'; // emerald
    if (rating >= 4.0) return '#f59e0b'; // amber
    if (rating >= 3.0) return '#ef4444'; // red
    return '#6b7280'; // gray
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'active': '#10b981',
      'pending': '#f59e0b',
      'completed': '#6366f1',
      'cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  }

  getBadgeClass(badge: string | null): string {
    if (!badge) return '';
    const classes: Record<string, string> = {
      'urgent': 'badge-urgent',
      'featured': 'badge-featured',
      'new': 'badge-new'
    };
    return classes[badge] || '';
  }

  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Ahora';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  formatPrice(price: number | null): string {
    if (!price) return '';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  getCategoryName(categoryId: string | null): string {
    if (!categoryId) return '';
    const category = this.categories.find(c => c.id === categoryId);
    return category?.name || categoryId;
  }

  getAvailabilityLabel(availability: string | null): string {
    if (!availability) return 'Cualquier momento';
    const labels: Record<string, string> = {
      'today': 'Hoy',
      'week': 'Esta semana',
      'now': 'Disponible ahora'
    };
    return labels[availability] || availability;
  }

  getSortLabel(sort: string | null): string {
    const labels: Record<string, string> = {
      'distance': 'Más cercano',
      'price_low': 'Precio ↓',
      'price_high': 'Precio ↑',
      'rating': 'Mejor rating'
    };
    return labels[sort ?? ''] || sort || '';
  }

  getTypeLabel(type: string | null): string {
    if (!type) return '';
    return type === 'services' ? 'Servicios' : 'Viajes';
  }

  async openPublicationDetail(assignment: Publication): Promise<void> {
    // Navegar según tipo
    if (assignment.type === 'service') {
      this.viewService(assignment.id);
    } else {
      this.viewRide(assignment.id);
    }
  }

  viewService(id: number) {
    this._service.url(`/home/${id}/service-detail`);
  }

  viewRide(id: number) {
    this._service.url(`/home/${id}/ride-detail`);
  }

  private initMap() {
    if (this.mapInitialized) return;

    const mapContainer = document.getElementById('leaflet-map');
    if (!mapContainer) return;

    // Centro en Buenos Aires como ejemplo, usa tu ubicación real
    this.map = L.map('leaflet-map', {
      zoomControl: false,
      attributionControl: false
    }).setView([-34.6037, -58.3816], 13);

    // Tile layer - estilo claro premium
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(this.map);

    // Zoom control custom position
    L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);

    // Agregar marcadores de ejemplo basados en publications
    this.addMapMarkers();

    this.mapInitialized = true;
  }

  private addMapMarkers() {
    // Limpiar marcadores anteriores
    this.mapMarkers.forEach(m => m.remove());
    this.mapMarkers = [];

    // Datos de ejemplo - reemplaza con tus publications reales
    const demoLocations = this.publications.map((p: Publication) => {
      const data = {
        title: p.title,
        category: p.type_label,
        price: p.meta['price'],
        rating: p.user.rating,
        type: p.type,
        image: '',
        lat: 0,
        lng: 0
      };
      if (p.type === 'ride' && p.detail) {
        data.image = p.user.avatar || '';
        if ('origin_lng' in p.detail) {
          data.lat = p.detail?.origin_lat || 0;
          data.lng = p.detail?.origin_lng || 0;
        }
      } else if (p.type === 'service' && p.detail) {
        data.price = p.meta['budget_range'];
        if ('images' in p.detail) {
          data.image = p.detail?.images?.[0] || '';
        }
        if ('latitude' in p.detail) {
          data.lat = p.detail?.latitude || 0;
          data.lng = p.detail?.longitude || 0;
        }
      }
      return data;
    });

    console.log(demoLocations);

    // Crear icono custom
    const createCustomIcon = (type: string) => {
      const color = type === 'service' ? '#6366f1' : '#10b981';
      return L.divIcon({
        className: 'custom-map-marker',
        html: `
        <div class="marker-pin" style="background: ${color}">
          <ion-icon name="${type === 'service' ? 'construct-outline' : 'car-outline'}"></ion-icon>
        </div>
        <div class="marker-pulse" style="background: ${color}20"></div>
      `,
        iconSize: [40, 48],
        iconAnchor: [20, 48],
        popupAnchor: [0, -48]
      });
    };

    demoLocations.forEach(loc => {
      const marker = L.marker([loc.lat, loc.lng], {
        icon: createCustomIcon(loc.type)
      }).addTo(this.map);

      // Popup premium
      const popupContent = `
      <div class="map-popup">
        <div class="popup-image">
          <img src="${loc.image}" alt="${loc.title}" />
        </div>
        <div class="popup-content">
          <span class="popup-category">${loc.category}</span>
          <h4 class="popup-title">${loc.title}</h4>
          <div class="popup-meta">
            <span class="popup-price">${loc.price}</span>
            <span class="popup-rating">
              <ion-icon name="star"></ion-icon> ${loc.rating}
            </span>
          </div>
        </div>
      </div>
    `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        className: 'premium-popup',
        offset: [0, -10]
      });

      this.mapMarkers.push(marker);
    });

    // Ajustar vista a todos los marcadores si hay más de uno
    if (demoLocations.length > 1) {
      const group = L.featureGroup(this.mapMarkers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  async centerOnUser() {
    try {
      const location = await this._locationService.getCurrentPosition();
      if (location && this.map) {
        this.map.flyTo([location.lat, location.lng], 15, {
          duration: 1.5
        });

        // Marcador de usuario
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: `
          <div class="user-dot"></div>
          <div class="user-ring"></div>
        `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([location.lat, location.lng], { icon: userIcon })
          .addTo(this.map)
          .bindPopup('Tu ubicación', { closeButton: false });
      }
    } catch (error) {
      this.showToast('No se pudo obtener tu ubicación', 'warning');
    }
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this._service.Toast({
      message, duration: 2000, position: 'bottom', color,
      buttons: [{ icon: 'close-outline', role: 'cancel' }]
    });
  }
}