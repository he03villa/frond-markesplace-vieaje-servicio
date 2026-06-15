import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonIcon } from "@ionic/angular/standalone";
import { ServiceService } from 'src/app/services/service.service';
import { ModalController } from '@ionic/angular/standalone';
import { ServiceRequestsService } from 'src/app/services/service-requests.service';
import { addIcons } from 'ionicons';
import { add, camera, close, documentAttach, documents } from 'ionicons/icons';

@Component({
  selector: 'app-modal-complete-worker',
  templateUrl: './modal-complete-worker.component.html',
  styleUrls: ['./modal-complete-worker.component.scss'],
  standalone: true,
  imports: [IonIcon, FormsModule],
})
export class ModalCompleteWorkerComponent implements OnInit {

  @Input() service: any;
  @Input() acceptedOffer: any;

  private modalCtr: ModalController = inject(ModalController);
  private _service: ServiceService = inject(ServiceService);
  private _serviceRequests: ServiceRequestsService = inject(ServiceRequestsService);

  completionNotes = '';
  actualHours: number | null = null;
  evidenceImages: Array<{ file: File; preview: string }> = [];
  evidenceDocs: Array<{ file: File; name: string }> = [];
  
  toastVisible = false;
  toastMessage = '';
  toastType: 'default' | 'success' | 'error' = 'default';
  toastIcon = 'information-circle';

  constructor() { 
    addIcons({ close, camera, add, documentAttach, documents });
  }

  ngOnInit() { }

  get canSubmitCompletion(): boolean {
    return !!this.completionNotes.trim() && this.evidenceImages.length > 0;
  }

  closeCompleteModal(): void {
    this.modalCtr.dismiss();
    this.completionNotes = '';
    this.actualHours = null;
    this.evidenceImages = [];
    this.evidenceDocs = [];
    document.body.style.overflow = '';
  }

  onEvidenceImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const remainingSlots = 5 - this.evidenceImages.length;
    const files = Array.from(input.files).slice(0, remainingSlots);

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        this.showToast('La imagen no debe superar 5MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.evidenceImages.push({
          file,
          preview: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    input.value = '';
  }

  removeEvidenceImage(index: number): void {
    this.evidenceImages.splice(index, 1);
  }

  // Documentos de evidencia
  onEvidenceDocsSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    Array.from(input.files).forEach(file => {
      this.evidenceDocs.push({ file, name: file.name });
    });

    input.value = '';
  }

  removeEvidenceDoc(index: number): void {
    this.evidenceDocs.splice(index, 1);
  }

  // Enviar completado
  async submitCompletion(): Promise<void> {
    if (!this.canSubmitCompletion) return;

    const loading = await this._service.presentLoading({ message: 'Enviando evidencia...' });
    await loading.present();

    try {
      const formData = new FormData();
      formData.append('service_request_id', this.service.id);
      formData.append('completion_notes', this.completionNotes);

      if (this.actualHours) {
        formData.append('actual_hours', this.actualHours.toString());
      }

      this.evidenceImages.forEach((img, i) => {
        formData.append(`evidence_images[${i}]`, img.file);
      });

      this.evidenceDocs.forEach((doc, i) => {
        formData.append(`evidence_docs[${i}]`, doc.file);
      });

      // Llamada al backend
      const response: any = await this._serviceRequests.saveDeliverRequest(this.service.id, formData);

      if (response.success) {
        this.service.status = 'delivered';
        this.service.service_requests_delivered = {
          notes: this.completionNotes,
          images: this.evidenceImages.map(i => i.preview),
          documents: this.evidenceDocs.map(d => d.name)
        };

        this.closeCompleteModal();
        this.showToast('¡Trabajo entregado! Esperando aprobación del cliente', 'success');

        /* // Notificar por WebSocket
        this.websocketService.sendToChannel(`service.${this.service.id}`, {
          type: 'delivered',
          service_id: this.service.id,
          worker_id: this.currentUser.id
        }); */
      }
    } catch (error) {
      console.error(error);
      this.showToast('Error al entregar el trabajo', 'error');
    } finally {
      await loading.dismiss();
    }
  }

  private showToast(message: string, type: 'default' | 'success' | 'error' = 'default') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastIcon = type === 'success' ? 'checkmark-circle' :
      type === 'error' ? 'close-circle' : 'information-circle';
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }

}
