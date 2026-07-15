import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonIcon, IonSearchbar, IonItem, IonLabel, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locateOutline, searchOutline, navigateOutline, closeOutline, arrowForward } from 'ionicons/icons';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { SearchResult } from 'src/app/interface/search-result';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonIcon, IonSearchbar, IonItem, IonLabel, IonSpinner],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LocationPickerComponent implements OnInit, OnDestroy {

  // ─── MODOS ───
  // 'picker'  = seleccionar ubicación (draggable)
  // 'viewer'  = ver destino + calcular ruta desde mi posición
  // 'route'   = mostrar origen y destino con línea de ruta (SIN draggable)
  @Input() mode: 'picker' | 'viewer' | 'route' = 'picker';

  // ─── PICKER ───
  @Input() latitude: number = 11.2408;
  @Input() longitude: number = -74.1990;
  @Input() currentAddress: string = '';
  @Output() addressManuallyChanged = new EventEmitter<string>();
  @Output() locationSelected = new EventEmitter<{ lat: number, lng: number, address: string }>();

  // ─── VIEWER ───
  @Input() destinationLat?: number;
  @Input() destinationLng?: number;
  @Input() destinationAddress?: string;
  @Output() routeCalculated = new EventEmitter<{ distance: number, duration: number }>();

  // ─── ROUTE (nuevo) ───
  @Input() originLat?: number;
  @Input() originLng?: number;
  @Input() originAddress?: string;

  @Input() mapId: string = 'map-' + Math.random().toString(36).substring(7);

  private map!: L.Map;
  private marker!: L.Marker;
  private routingControl: any;

  // Nuevos elementos para modo route
  private originMarker?: L.Marker;
  private destinationMarker?: L.Marker;
  private routeLine?: L.Polyline;

  private isMapInitialized = false;
  private userLocation: L.LatLng | null = null;
  private locationService = inject(LocationService);

  searchQuery: string = '';
  searchResults: SearchResult[] = [];
  isSearching: boolean = false;
  manualAddress: string = '';
  isCalculatingRoute: boolean = false;
  routeInfo: { distance: number; duration: number } | null = null;

  constructor() {
    addIcons({ locateOutline, searchOutline, navigateOutline, closeOutline, arrowForward });
  }

  ngOnInit() {
    this.manualAddress = this.currentAddress;
    setTimeout(() => this.initMap(), 300);
  }

  ngOnDestroy() {
    this.destroyMap();
  }

  private destroyMap() {
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
      this.routingControl = null;
    }
    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
      this.routeLine = undefined;
    }
    if (this.originMarker) {
      this.map.removeLayer(this.originMarker);
      this.originMarker = undefined;
    }
    if (this.destinationMarker) {
      this.map.removeLayer(this.destinationMarker);
      this.destinationMarker = undefined;
    }
    if (this.map) {
      try {
        this.map.remove();
        (this.map as any) = null;
        (this.marker as any) = null;
        this.isMapInitialized = false;
      } catch (error) {
        console.error('Error al destruir el mapa:', error);
      }
    }
  }

  private initMap() {
    if (this.isMapInitialized) return;

    try {
      const container = document.getElementById(this.mapId);
      if (!container) {
        console.error('Contenedor del mapa no encontrado:', this.mapId);
        return;
      }

      // Si Leaflet ya inicializó este contenedor, marcar y salir
      if ((container as any)._leaflet_id) {
        this.isMapInitialized = true;
        return;
      }

      if (container.hasChildNodes()) {
        container.innerHTML = '';
      }

      // ─── Centro inicial según modo ───
      let centerLat = this.latitude;
      let centerLng = this.longitude;
      let zoom = 13;

      if (this.mode === 'route' && this.originLat && this.destinationLat) {
        // Centrar en el punto medio entre origen y destino
        centerLat = (this.originLat + this.destinationLat) / 2;
        centerLng = (this.originLng! + this.destinationLng!) / 2;
        zoom = 11;
      } else if (this.mode === 'viewer' && this.destinationLat) {
        centerLat = this.destinationLat;
        centerLng = this.destinationLng!;
        zoom = 13;
      }

      this.map = L.map(this.mapId).setView([centerLat, centerLng], zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
      }).addTo(this.map);

      // ─── MODO ROUTE ───
      if (this.mode === 'route') {
        this.initRouteMode();
        this.isMapInitialized = true;
        return; // Salir temprano, no crear marcador draggable
      }

      // ─── MARCADOR COMÚN (picker / viewer) ───
      const customIcon = L.icon({
        iconUrl: 'assets/marker-icon.png',
        shadowUrl: 'assets/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      if (this.mode === 'viewer' && this.destinationLat && this.destinationLng) {
        this.marker = L.marker([this.destinationLat, this.destinationLng], {
          draggable: false,
          icon: customIcon
        }).addTo(this.map)
          .bindPopup(this.destinationAddress || 'Destino')
          .openPopup();
      } else {
        // Modo picker
        this.marker = L.marker([this.latitude, this.longitude], {
          draggable: true,
          icon: customIcon
        }).addTo(this.map);

        this.marker.on('dragend', async () => {
          const position = this.marker.getLatLng();
          await this.emitLocation(position.lat, position.lng);
        });

        this.map.on('click', async (e: L.LeafletMouseEvent) => {
          this.marker.setLatLng(e.latlng);
          await this.emitLocation(e.latlng.lat, e.latlng.lng);
        });
      }

      this.isMapInitialized = true;

      // Forzar recálculo en el siguiente frame (evita offsetHeight 0)
      setTimeout(() => {
        if (this.map) this.map.invalidateSize();
      }, 0);
    } catch (error) {
      console.error('Error al inicializar el mapa:', error);
    }
  }

  // ═══════════════════════════════════════════════════════
  // NUEVO: MODO ROUTE
  // ═══════════════════════════════════════════════════════
  private initRouteMode() {
    if (!this.originLat || !this.originLng || !this.destinationLat || !this.destinationLng) {
      console.warn('Modo route requiere originLat/Lng y destinationLat/Lng');
      return;
    }

    // Iconos personalizados
    const originIcon = L.divIcon({
      className: 'route-marker',
      html: `<div class="route-pin origin-pin"><span>A</span></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    });

    const destIcon = L.divIcon({
      className: 'route-marker',
      html: `<div class="route-pin dest-pin"><span>B</span></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    });

    // Marcadores
    this.originMarker = L.marker([this.originLat, this.originLng], { icon: originIcon })
      .addTo(this.map)
      .bindPopup(this.originAddress || 'Origen');

    this.destinationMarker = L.marker([this.destinationLat, this.destinationLng], { icon: destIcon })
      .addTo(this.map)
      .bindPopup(this.destinationAddress || 'Destino');

    // ✅ RUTA REAL via OSRM HTTP + L.polyline
    this.fetchOsrmRoute();
  }

  private async fetchOsrmRoute() {
    const originLat = this.originLat!;
    const originLng = this.originLng!;
    const destLat = this.destinationLat!;
    const destLng = this.destinationLng!;

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=false`;
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) {
        let message = `Error del servidor (${response.status})`;
        try {
          const errorBody = await response.json();
          if (errorBody.code === 'NoRoute') {
            message = 'No hay ruta de conducción entre origen y destino';
          } else if (errorBody.message) {
            message = errorBody.message;
          }
        } catch (_) { }
        throw new Error(message);
      }

      const data = await response.json();
      if (!data.routes?.length) {
        throw new Error('No se encontró una ruta entre los puntos');
      }

      const route = data.routes[0];
      const coords: [number, number][] = route.geometry.coordinates.map(
        (c: number[]) => [c[1], c[0]]
      );

      this.routeLine = L.polyline(coords, {
        color: '#4f46e5',
        weight: 5,
        opacity: 0.8,
      }).addTo(this.map);

      this.map.fitBounds((this.routeLine as any).getBounds(), {
        padding: [60, 60],
        maxZoom: 16,
      });
    } catch (error) {
      console.error('Error consultando OSRM en modo route:', error);
    }
  }

  // ═══════════════════════════════════════════════════════
  // VIEWER: Calcular ruta (desde mi posición actual)
  // ═══════════════════════════════════════════════════════
  async calculateRoute() {
    if (!this.destinationLat || !this.destinationLng) {
      alert('No hay destino definido');
      return;
    }

    this.isCalculatingRoute = true;

    // 1. Obtener ubicación actual
    const pos = await this.locationService.getCurrentPosition();
    if (!pos) {
      console.error('No se pudo obtener la ubicación del usuario');
      alert('No se pudo obtener tu ubicación actual. Verifica los permisos.');
      this.isCalculatingRoute = false;
      return;
    }

    const originLat = pos.lat;
    const originLng = pos.lng;

    // 2. Validar que el mapa esté listo
    if (!this.map) {
      console.error('El mapa no está inicializado');
      alert('Error al cargar el mapa. Intenta de nuevo.');
      this.isCalculatingRoute = false;
      return;
    }

    // 3. Limpiar ruta anterior
    this.clearRoute();

    // 4. Agregar marcador de origen (ubicación del usuario)
    const originIcon = L.icon({
      iconUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    this.originMarker = L.marker([pos.lat, pos.lng], { icon: originIcon }).addTo(this.map)
      .bindPopup('Mi ubicación');

    // 5. Consultar OSRM directamente via HTTP
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${this.destinationLng},${this.destinationLat}?overview=full&geometries=geojson&steps=false`;

      const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) {
        let message = `Error del servidor (${response.status})`;
        try {
          const errorBody = await response.json();
          if (errorBody.code === 'NoRoute') {
            message = 'No hay ruta de conducción entre tu ubicación y el destino';
          } else if (errorBody.message) {
            message = errorBody.message;
          }
        } catch (_) { }
        throw new Error(message);
      }

      const data = await response.json();

      if (!data.routes?.length) {
        throw new Error('No se encontró una ruta entre los puntos');
      }

      const route = data.routes[0];
      const coords: [number, number][] = route.geometry.coordinates.map(
        (c: number[]) => [c[1], c[0]]
      );

      // 6. Dibujar polyline en el mapa
      this.routeLine = L.polyline(coords, {
        color: '#3880ff',
        weight: 6,
        opacity: 0.8,
      }).addTo(this.map);

      this.map.fitBounds((this.routeLine as any).getBounds(), {
        padding: [60, 60],
        maxZoom: 16,
      });

      // 7. Emitir info de la ruta
      this.routeInfo = {
        distance: route.distance / 1000,
        duration: route.duration / 60,
      };
      this.routeCalculated.emit(this.routeInfo);

    } catch (error) {
      console.error('Error consultando OSRM:', error);
      alert(
        error instanceof Error
          ? `Error: ${error.message}`
          : 'No se pudo calcular la ruta. Intenta de nuevo.'
      );
    }

    this.isCalculatingRoute = false;
  }

  clearRoute() {
    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
      this.routeLine = undefined;
    }
    if (this.originMarker) {
      this.map.removeLayer(this.originMarker);
      this.originMarker = undefined;
    }
    this.routeInfo = null;
  }

  // ═══════════════════════════════════════════════════════
  // PICKER: Búsqueda y geocodificación (sin cambios)
  // ═══════════════════════════════════════════════════════
  async onSearchInput(event: any) {
    if (this.mode === 'viewer' || this.mode === 'route') return;

    const query = event.target.value;
    if (!query || query.trim().length < 3) {
      this.searchResults = [];
      return;
    }

    this.isSearching = true;
    await this.searchAddress(query);
    this.isSearching = false;
  }

  async searchAddress(query: string) {
    try {
      const biasLat = 11.2408;
      const biasLon = -74.1990;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${encodeURIComponent(query)}` +
        `&viewbox=${biasLon - 0.5},${biasLat - 0.5},${biasLon + 0.5},${biasLat + 0.5}` +
        `&bounded=0&limit=5&addressdetails=1`,
        { headers: { 'User-Agent': 'IonicMarketplaceApp/1.0' } }
      );

      const data = await response.json();
      this.searchResults = data;
    } catch (error) {
      console.error('Error buscando dirección:', error);
      this.searchResults = [];
    }
  }

  selectSearchResult(result: SearchResult) {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    if (this.map && this.marker) {
      this.map.setView([lat, lon], 16);
      this.marker.setLatLng([lat, lon]);
      this.emitLocation(lat, lon, result.display_name);
    }

    this.searchQuery = '';
    this.searchResults = [];
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
  }

  async getCurrentLocation() {
    if (this.mode === 'viewer') {
      if (this.destinationLat && this.destinationLng) {
        this.map.setView([this.destinationLat, this.destinationLng], 15);
      }
      return;
    }

    if (this.mode === 'route') {
      // En modo route, centrar para ver toda la ruta
      if (this.originLat && this.destinationLat) {
        const bounds = L.latLngBounds(
          [this.originLat, this.originLng!],
          [this.destinationLat, this.destinationLng!]
        );
        this.map.fitBounds(bounds, { padding: [60, 60] });
      }
      return;
    }

    try {
      const pos = await this.locationService.getCurrentPosition();
      if (pos && this.map && this.marker) {
        this.map.setView([pos.lat, pos.lng], 15);
        this.marker.setLatLng([pos.lat, pos.lng]);
        await this.emitLocation(pos.lat, pos.lng);
      }
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      alert('No se pudo obtener tu ubicación. Verifica los permisos.');
    }
  }

  onManualAddressChange() {
    if (this.mode === 'viewer' || this.mode === 'route') return;

    if (this.marker) {
      const position = this.marker.getLatLng();
      this.locationSelected.emit({
        lat: position.lat,
        lng: position.lng,
        address: this.manualAddress
      });
    }
  }

  onManualAddressInput(event: any) {
    this.manualAddress = event.target.value;
  }

  private async emitLocation(lat: number, lng: number, address?: string) {
    if (!address) {
      address = await this.reverseGeocode(lat, lng);
    }
    this.manualAddress = address;
    this.locationSelected.emit({ lat, lng, address });
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'IonicMarketplaceApp/1.0' } }
      );
      const data = await response.json();

      if (data.address) {
        const address = data.address;
        const parts = [];

        if (address.neighbourhood) parts.push(address.neighbourhood);
        else if (address.suburb) parts.push(address.suburb);
        else if (address.quarter) parts.push(address.quarter);
        else if (address.hamlet) parts.push(address.hamlet);

        if (address.road) {
          let roadPart = address.road;
          if (address.house_number) roadPart = `${address.road} #${address.house_number}`;
          parts.push(roadPart);
        }

        if (address.city || address.town || address.village) {
          parts.push(address.city || address.town || address.village);
        }

        if (address.state) parts.push(address.state);

        return parts.join(', ') || data.display_name;
      }

      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Error en geocoding:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }

  updatePosition(lat: number, lng: number) {
    if (this.map && this.marker) {
      this.map.setView([lat, lng], 15);
      this.marker.setLatLng([lat, lng]);
    }
  }
}