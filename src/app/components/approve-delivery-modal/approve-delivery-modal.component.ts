import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalController, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmark, checkmarkCircle, close, documentText, lockClosed, star, starOutline, time } from 'ionicons/icons';
import { DeliveriesServices } from 'src/app/services/deliveries.service';

@Component({
  selector: 'app-approve-delivery-modal',
  templateUrl: './approve-delivery-modal.component.html',
  styleUrls: ['./approve-delivery-modal.component.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, FormsModule]
})
export class ApproveDeliveryModalComponent  implements OnInit {

  @Input() deliveryId!: number;
  @Input() workerName!: string;
  @Input() workerAvatar!: string;
  @Input() completionNotes!: string;
  @Input() actualHours!: number | null;

  private modalCtrl: ModalController = inject(ModalController);
  private _deliveriesServices: DeliveriesServices = inject(DeliveriesServices);

  rating = 0;
  hoverRating = 0;
  comment = '';
  feedback = '';
  isSubmitting = false;
  showConfetti = false;

  ratingLabels: { [key: number]: string } = {
    1: 'Muy malo', 2: 'Malo', 3: 'Regular', 4: 'Bueno', 5: 'Excelente'
  };

  ratingEmojis: { [key: number]: string } = {
    1: '\ud83d\ude1e', 2: '\ud83d\ude15', 3: '\ud83d\ude10', 4: '\ud83d\ude42', 5: '\ud83e\udd29'
  };

  ratingColors: { [key: number]: string } = {
    1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#22c55e', 5: '#10b981'
  };

  constructor() { 
    addIcons({ close, checkmark, checkmarkCircle, star, starOutline, time, documentText, lockClosed });
  }

  ngOnInit() {}

  getRatingLabel(): string {
    return this.ratingLabels[this.rating] || 'Selecciona una calificacion';
  }

  getRatingEmoji(): string {
    return this.ratingEmojis[this.rating] || '\u2b50';
  }

  getRatingColor(): string {
    return this.ratingColors[this.rating] || '#94a3b8';
  }

  setRating(star: number): void {
    this.rating = star;
    if (star === 5) {
      this.showConfetti = true;
      setTimeout(() => this.showConfetti = false, 2000);
    }
  }

  dismiss(data?: any): void {
    this.modalCtrl.dismiss(data);
  }

  async submit(): Promise<void> {
    if (this.rating === 0 || this.isSubmitting) return;
    this.isSubmitting = true;
    try {
      const data = {
        action: 'approve',
        rating: this.rating,
        comment: this.comment || null,
        feedback: this.feedback || null
      };

      const response = await this._deliveriesServices.respond(this.deliveryId, data);
      
      this.dismiss({ approved: true, data: response });
    } catch (error: any) {
      this.isSubmitting = false;
    }
  }

}
