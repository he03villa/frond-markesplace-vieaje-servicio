import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalController, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircle, close, closeCircle, warning } from 'ionicons/icons';
import { DeliveriesServices } from 'src/app/services/deliveries.service';

@Component({
  selector: 'app-reject-modal',
  templateUrl: './reject-modal.component.html',
  styleUrls: ['./reject-modal.component.scss'],
  imports: [IonContent, IonIcon, FormsModule],
})
export class RejectModalComponent {

  @Input() deliveryId!: number;
  @Input() workerName!: string;
  @Input() workerAvatar!: string;

  private modalCtrl: ModalController = inject(ModalController);
  private _deliveriesServices: DeliveriesServices = inject(DeliveriesServices);

  reason = '';
  isSubmitting = false;
  confirmed = false;

  rejectReasons = [
    'El trabajo no fue realizado',
    'La calidad es muy baja',
    'No cumple con los requisitos',
    'El worker no termino el trabajo',
    'Hubo un problema de comunicacion'
  ];

  constructor() {
    addIcons({ close, closeCircle, alertCircle, warning });
  }

  selectReason(r: string): void {
    this.reason = r;
  }

  dismiss(data?: any): void {
    this.modalCtrl.dismiss(data);
  }

  async submit(): Promise<void> {
    if (!this.reason.trim() || !this.confirmed || this.isSubmitting) return;
    this.isSubmitting = true;
    try {
      const data  = {
        action: 'reject', feedback: this.reason.trim()
      }
      const response = await this._deliveriesServices.respond(this.deliveryId, data);
      this.dismiss({ rejected: true, data: response });
    } catch (error: any) {
      this.isSubmitting = false;
    }
  }
}
