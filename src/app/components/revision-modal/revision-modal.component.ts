import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalController, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, closeCircle, create, flash, informationCircle, refreshCircle } from 'ionicons/icons';
import { DeliveriesServices } from 'src/app/services/deliveries.service';

@Component({
  selector: 'app-revision-modal',
  templateUrl: './revision-modal.component.html',
  styleUrls: ['./revision-modal.component.scss'],
  standalone: true,
  imports: [IonContent, FormsModule, IonIcon]
})
export class RevisionModalComponent {

  @Input() deliveryId!: number;
  @Input() workerName!: string;
  @Input() workerAvatar!: string;

  private modalCtrl: ModalController = inject(ModalController);
  private _deliveriesServices: DeliveriesServices = inject(DeliveriesServices);

  feedback = '';
  isSubmitting = false;

  quickReasons = [
    'El trabajo no cumple con lo acordado',
    'Faltan detalles por completar',
    'La calidad no es la esperada',
    'Necesita ajustes menores',
    'No se respetaron las especificaciones'
  ];

  constructor() { 
    addIcons({ close, closeCircle, refreshCircle, flash, informationCircle, create });
  }

  selectReason(reason: string): void {
    this.feedback = reason;
  }

  dismiss(data?: any): void {
    this.modalCtrl.dismiss(data);
  }

  async submit(): Promise<void> {
    if (!this.feedback.trim() || this.isSubmitting) return;
    this.isSubmitting = true;
    const data = {
      action: 'revision',
      feedback: this.feedback.trim()
    }
    try {
      const response = await this._deliveriesServices.respond(this.deliveryId, data);
      this.dismiss({ revised: true, data: response });
    } catch (error: any) {
      this.isSubmitting = false;
    }
  }

}
