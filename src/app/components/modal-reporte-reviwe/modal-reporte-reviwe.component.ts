import { Component, inject, Input, OnInit } from '@angular/core';
import { Review } from 'src/app/interface/review';
import { ReviewsService } from 'src/app/services/reviews.service';
import { ModalController, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline, checkmarkCircle, checkmarkCircleOutline, closeOutline, ellipsisHorizontalOutline, flagOutline, helpCircleOutline, sadOutline } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-reporte-reviwe',
  templateUrl: './modal-reporte-reviwe.component.html',
  styleUrls: ['./modal-reporte-reviwe.component.scss'],
  standalone: true,
  imports: [IonIcon, FormsModule]
})
export class ModalReporteReviweComponent implements OnInit {

  @Input() review: Review | undefined;

  private _reviewsService: ReviewsService = inject(ReviewsService);
  private modalCtr: ModalController = inject(ModalController);

  reportReason = '';
  reportDetail = '';
  reportSubmitted = false;
  reportReasons = [
    { id: 'inappropriate', label: 'Contenido inapropiado', icon: 'alert-circle-outline' },
    { id: 'fake', label: 'Reseña falsa o engañosa', icon: 'help-circle-outline' },
    { id: 'offensive', label: 'Lenguaje ofensivo', icon: 'sad-outline' },
    { id: 'spam', label: 'Spam o publicidad', icon: 'flag-outline' },
    { id: 'other', label: 'Otro motivo', icon: 'ellipsis-horizontal-outline' }
  ];

  selectedReportReason = '';

  constructor() { 
    addIcons({
      closeOutline, alertCircleOutline, helpCircleOutline, sadOutline, flagOutline, ellipsisHorizontalOutline,
      checkmarkCircle, checkmarkCircleOutline
    });
  }

  ngOnInit() { }

  closeReportModal(data: any | undefined = undefined) {
    this.modalCtr.dismiss(data);
  }

  selectReportReason(reasonId: string) {
    this.selectedReportReason = reasonId;

    if (reasonId === 'other') {
      this.reportDetail = '';
    } else {
      const reason = this.reportReasons.find(reason => reason.id === reasonId);
      this.reportDetail = reason ? reason.label : '';
    }
  }

  canSubmitReport(): boolean {
    return this.selectedReportReason !== '' &&
      (this.selectedReportReason !== 'other' || this.reportDetail.trim().length >= 10);
  }

  async submitReport() {
    if (!this.canSubmitReport()) return;

    // Simular envío
    await new Promise(r => setTimeout(r, 800));

    console.log('Reporte enviado', this.review, this.selectedReportReason, this.reportDetail);
    try {
      const id = parseInt(this.review?.id as string);
      const data = { reason: this.reportDetail };
      const res = await this._reviewsService.saveReport(id, data);
      if (res.success) {
        this.reportSubmitted = true;
        setTimeout(() => {
          this.closeReportModal(res);
        }, 3000);
      }
    } catch (error) {
      console.log(error);
    }
  }

}
