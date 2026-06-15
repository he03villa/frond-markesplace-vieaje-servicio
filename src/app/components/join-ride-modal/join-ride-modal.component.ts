import { DecimalPipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonTextarea, IonIcon, IonSpinner } from "@ionic/angular/standalone";
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { carSport, chatbubbleOutline, checkmarkCircle, closeOutline, informationCircleOutline, locationOutline, lockClosedOutline, navigateOutline, person, personOutline, shieldCheckmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-join-ride-modal',
  templateUrl: './join-ride-modal.component.html',
  styleUrls: ['./join-ride-modal.component.scss'],
  standalone: true,
  imports: [FormsModule, DecimalPipe, IonButton, IonContent, IonTextarea, IonIcon, IonSpinner]
})
export class JoinRideModalComponent  implements OnInit {

  @Input() rideId!: string;
  @Input() maxSeats: number = 1;
  @Input() ridePrice: number = 0;

  seats: number = 1;
  pickupLocation: string = '';
  dropoffLocation: string = '';
  specialRequests: string = '';

  showSummary: boolean = false;
  isSubmitting: boolean = false;
  activeField: string | null = null;

  private modalCtrl = inject(ModalController);

  constructor() { 
    addIcons({
      closeOutline, carSport, person, personOutline,
      locationOutline, navigateOutline, chatbubbleOutline,
      checkmarkCircle, informationCircleOutline,
      shieldCheckmarkOutline, lockClosedOutline
    });
  }

  ngOnInit() {}

  get availableSeatsArray(): number[] {
    return Array.from({ length: this.maxSeats }, (_, i) => i + 1);
  }

  // Visual: asientos "llenos" hasta el seleccionado
  isSeatFilled(n: number): boolean {
    return n <= this.seats;
  }

  selectSeat(n: number) {
    if (n > this.maxSeats) return;
    this.seats = n;
    // Haptic feedback
    if ((window as any).navigator?.vibrate) {
      (window as any).navigator.vibrate(30);
    }
  }

  toggleSummary() {
    this.showSummary = !this.showSummary;
  }

  getTotal(): number {
    // Puedes agregar lógica de descuento aquí
    return this.seats * this.ridePrice;
  }

  onFieldFocus(field: string) {
    this.activeField = field;
  }

  onFieldBlur() {
    this.activeField = null;
  }

  dismiss(data?: any) {
    this.modalCtrl.dismiss(data);
  }

  async confirm() {
    if (!this.seats || this.isSubmitting) return;
    
    this.isSubmitting = true;
    
    // Simular delay para UX
    await new Promise(r => setTimeout(r, 800));
    this.dismiss({
      seats: this.seats,
      pickupLocation: this.pickupLocation,
      dropoffLocation: this.dropoffLocation,
      specialRequests: this.specialRequests
    });
  }

}
