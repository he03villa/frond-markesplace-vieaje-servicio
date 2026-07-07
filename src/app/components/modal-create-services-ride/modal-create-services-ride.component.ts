import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonButtons, IonTitle, IonSegment, IonSegmentButton, IonLabel, IonList, IonItem, IonInput, IonTextarea, IonSelect, IonSelectOption, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonText, IonDatetime, IonFooter } from "@ionic/angular/standalone";
import { ModalController } from '@ionic/angular/standalone';
import { ImageUploadSectionComponent } from 'src/app/components/image-upload-section/image-upload-section.component';
import { addIcons } from 'ionicons';
import { alertCircle, calculatorOutline, car, checkmarkCircle, closeOutline, hammer, locateOutline } from 'ionicons/icons';
import { LocationPickerComponent } from '../location-picker/location-picker.component';
import { ServiceService } from 'src/app/services/service.service';
import { ServiceRequestsService } from 'src/app/services/service-requests.service';
import { RidesService } from 'src/app/services/rides.service';

@Component({
  selector: 'app-modal-create-services-ride',
  templateUrl: './modal-create-services-ride.component.html',
  styleUrls: ['./modal-create-services-ride.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonItem,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    IonDatetime,
    IonFooter,
    ImageUploadSectionComponent,
    LocationPickerComponent
  ],
})
export class ModalCreateServicesRideComponent implements OnInit {
  @Input() type: 'service' | 'ride' = 'service';

  private modalCtr: ModalController = inject(ModalController);
  private _service: ServiceService = inject(ServiceService);
  private _serviceRequestsService: ServiceRequestsService = inject(ServiceRequestsService);
  private _riderService: RidesService = inject(RidesService);
  publicationType: 'service' | 'ride' = 'service';
  showErrors = false;

  // Formulario para servicio
  serviceForm: any = {
    title: '',
    description: '',
    category: '',
    address: '',
    latitude: null,
    longitude: null,
    budget_min: null,
    budget_max: null,
    deadline: null
  };

  serviceImages: any[] = [];

  // Formulario para viaje
  rideForm: any = {
    origin_address: '',
    origin_lat: null,
    origin_lng: null,
    destination_address: '',
    destination_lat: null,
    destination_lng: null,
    departure_time: null,
    available_seats: null,
    price_per_seat: null,
    notes: '',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_year: null,
    vehicle_color: ''
  };

  minDate: string = new Date().toISOString().split('T')[0];
  currentYear: number = new Date().getFullYear();

  constructor() {
    addIcons({ locateOutline, hammer, car, closeOutline, alertCircle, checkmarkCircle, calculatorOutline });
  }

  ngOnInit() { 
    this.publicationType = this.type;
  }

  onTypeChange() {
    const form = document.querySelector('form');
    form?.classList.remove('form-transition');
    setTimeout(() => form?.classList.add('form-transition'), 50);
  }

  async useCurrentLocation(type: string) {
    if (navigator.geolocation) {
      const loading = await this._service.presentLoading({
        message: 'Obteniendo ubicación...',
        spinner: 'crescent'
      });
      await loading.present();

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await loading.dismiss();

          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Obtener dirección usando reverse geocoding
          try {
            const address = await this.reverseGeocode(lat, lng);

            if (type === 'service') {
              this.serviceForm.latitude = lat;
              this.serviceForm.longitude = lng;
              this.serviceForm.address = address;
            } else if (type === 'origin') {
              this.rideForm.origin_lat = lat;
              this.rideForm.origin_lng = lng;
              this.rideForm.origin_address = address;
            } else if (type === 'destination') {
              this.rideForm.destination_lat = lat;
              this.rideForm.destination_lng = lng;
              this.rideForm.destination_address = address;
            }
          } catch (error) {
            this.showError('Error al obtener la dirección de la ubicación');
          }
        },
        async (error) => {
          await loading.dismiss();
          console.error('Error obteniendo ubicación:', error);
          this.showError('No se pudo obtener la ubicación. Asegúrate de tener el GPS activado.');
        }
      );
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    // Aquí implementarías el reverse geocoding usando una API como Google Maps o OpenStreetMap
    // Por ahora retornamos un placeholder
    try {
      /* const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0' // Requerido por Nominatim
          }
        }
      );
      const data = await response.json(); */
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Error en reverse geocoding:', error);
      return `Ubicación: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }

  onServiceImagesSelected(files: File[]) {
    this.handleImageSelection(files, this.serviceImages);
  }

  removeServiceImage(index: number) {
    this.serviceImages.splice(index, 1);
  }

  private handleImageSelection(files: File[], targetArray: any[]) {
    if (files) {
      for (let i = 0; i < Math.min(files.length, 5 - targetArray.length); i++) {
        const file = files[i];
        if (file.size > 2 * 1024 * 1024) {
          this.showError('La imagen no debe superar los 2MB');
          continue;
        }

        const reader = new FileReader();
        reader.onload = (e: any) => {
          targetArray.push({
            url: e.target.result,
            file: file
          });
        };
        reader.readAsDataURL(file);
      }
    }
  }

  isServiceFormValid(): boolean {
    const form = this.serviceForm;
    return !!form.title &&
      !!form.description &&
      !!form.category &&
      !!form.address &&
      !!form.latitude &&
      !!form.longitude &&
      (!form.budget_max || form.budget_max >= form.budget_min);
  }

  isRideFormValid(): boolean {
    const form = this.rideForm;
    return !!form.origin_address &&
      !!form.origin_lat &&
      !!form.origin_lng &&
      !!form.destination_address &&
      !!form.destination_lat &&
      !!form.destination_lng &&
      !!form.departure_time &&
      !!form.available_seats &&
      !!form.price_per_seat;
  }

  isFormValid(): boolean {
    if (this.publicationType === 'service') {
      return this.isServiceFormValid();
    } else {
      return this.isRideFormValid();
    }
  }

  async createPublication() {
    this.showErrors = true;
    if (!this.isFormValid()) {
      this.showError('Por favor completa todos los campos requeridos');
      return;
    }

    const loading = await this._service.presentLoading({
      message: this.publicationType === 'service' ? 'Publicando servicio...' : 'Publicando viaje...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      if (this.publicationType === 'service') {
        await this.createService();
      } else {
        await this.createRide();
      }

      await loading.dismiss();

      const message = this.publicationType === 'service'
        ? '¡Servicio publicado exitosamente!'
        : '¡Viaje publicado exitosamente!';

      this.showSuccess(message);

    } catch (error: any) {
      await loading.dismiss();
      this.handleError(error);
    }
  }

  private async createService() {
    const formData = new FormData();
    // Agregar campos del servicio
    console.log(this.serviceForm);
    Object.keys(this.serviceForm).forEach(key => {
      if (this.serviceForm[key] !== null && this.serviceForm[key] !== undefined) {
        formData.append(key, this.serviceForm[key]);
      }
    });

    // Agregar imágenes
    this.serviceImages.forEach((image, index) => {
      formData.append(`images[${index}]`, image.file);
    });

    try {
      const response:any = await this._serviceRequestsService.saveRequest(formData);
      console.log(response);
      if (response.success) {
      }
    } catch (error) {
    }
  }

  private async createRide() {
    // Para el viaje, podemos enviar como JSON
    const rideData = { ...this.rideForm };

    // Convertir valores numéricos
    rideData.origin_lat = parseFloat(rideData.origin_lat);
    rideData.origin_lng = parseFloat(rideData.origin_lng);
    rideData.destination_lat = parseFloat(rideData.destination_lat);
    rideData.destination_lng = parseFloat(rideData.destination_lng);
    rideData.available_seats = parseInt(rideData.available_seats);
    rideData.price_per_seat = parseFloat(rideData.price_per_seat);

    // Eliminar campos vacíos opcionales
    if (!rideData.notes) delete rideData.notes;
    if (!rideData.vehicle_brand) delete rideData.vehicle_brand;
    if (!rideData.vehicle_model) delete rideData.vehicle_model;
    if (!rideData.vehicle_year) delete rideData.vehicle_year;
    if (!rideData.vehicle_color) delete rideData.vehicle_color;

    try {
      const response:any = await this._riderService.saveRide(rideData);
      console.log(response);
      if (response.success) {
      }
    } catch (error) {
    }
  }

  private handleError(error: any) {
    if (error.status === 422) {
      // Errores de validación del backend
      const errors = error.error.errors;
      let errorMessage = 'Por favor corrige los siguientes errores:\n';
      Object.keys(errors).forEach(key => {
        errorMessage += `\n• ${errors[key].join(', ')}`;
      });
      this.showError(errorMessage);
    } else {
      const defaultMessage = this.publicationType === 'service'
        ? 'Error al publicar el servicio. Intenta nuevamente.'
        : 'Error al publicar el viaje. Intenta nuevamente.';
      this.showError(defaultMessage);
    }
  }

  async showError(message: string) {
    const alert = await this._service.Alert({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
  }

  async showSuccess(message: string) {
    const alert = await this._service.Alert({
      header: '¡Éxito!',
      message: message,
      buttons: [
        {
          text: 'Ver publicación',
          handler: () => {
            // Navegar a la publicación creada
          }
        },
        {
          text: 'Crear otra',
          handler: () => {
            this.resetForm();
          }
        }
      ]
    });
  }

  resetForm() {
    this.showErrors = false;
    if (this.publicationType === 'service') {
      this.serviceForm = {
        title: '',
        description: '',
        category: '',
        address: '',
        latitude: null,
        longitude: null,
        budget_min: null,
        budget_max: null,
        deadline: null
      };
      this.serviceImages = [];
    } else {
      this.rideForm = {
        origin_address: '',
        origin_lat: null,
        origin_lng: null,
        destination_address: '',
        destination_lat: null,
        destination_lng: null,
        departure_time: null,
        available_seats: null,
        price_per_seat: null,
        notes: '',
        vehicle_brand: '',
        vehicle_model: '',
        vehicle_year: null,
        vehicle_color: ''
      };
    }
  }

  // En create-publication.page.ts
  onImageLoad(event: any, imageIndex: number) {
    // 'event' es el evento de carga de la imagen HTML
    const imgElement = event.target;

    // Puedes acceder a las propiedades de la imagen cargada
    console.log(`Imagen ${imageIndex} cargada:`, {
      width: imgElement.width,
      height: imgElement.height,
      naturalWidth: imgElement.naturalWidth,
      naturalHeight: imgElement.naturalHeight
    });

    // Ejemplo de validación de dimensiones mínimas
    const MIN_WIDTH = 300;
    const MIN_HEIGHT = 300;

    if (imgElement.naturalWidth < MIN_WIDTH || imgElement.naturalHeight < MIN_HEIGHT) {
      console.warn(`Imagen ${imageIndex} es muy pequeña. Mínimo recomendado: ${MIN_WIDTH}x${MIN_HEIGHT}`);
      // Podrías mostrar una advertencia al usuario
    }

    // También podrías actualizar el objeto de imagen con las dimensiones
    // this.serviceImages[imageIndex].dimensions = {
    //   width: imgElement.width,
    //   height: imgElement.height
    // };
  }

  salir() {
    this.modalCtr.dismiss();
  }

  onLocationSelected(location: { lat: number, lng: number, address: string }) {
    this.serviceForm.latitude = location.lat;
    this.serviceForm.longitude = location.lng;
    this.serviceForm.address = location.address;
  }

  // Agregar estos métodos a tu modal-create-services-ride.component.ts

  onServiceLocationSelected(location: { lat: number, lng: number, address: string }) {
    console.log(location);
    this.serviceForm.latitude = location.lat;
    this.serviceForm.longitude = location.lng;
    this.serviceForm.address = location.address;
  }

  onOriginLocationSelected(location: { lat: number, lng: number, address: string }) {
    this.rideForm.origin_lat = location.lat;
    this.rideForm.origin_lng = location.lng;
    this.rideForm.origin_address = location.address;
  }

  onDestinationLocationSelected(location: { lat: number, lng: number, address: string }) {
    this.rideForm.destination_lat = location.lat;
    this.rideForm.destination_lng = location.lng;
    this.rideForm.destination_address = location.address;
  }

}
