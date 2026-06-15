import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonIcon, IonContent, IonInput, IonTextarea, IonFooter, IonSpinner 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  arrowBack, bulb, bulbOutline, cashOutline, chatbubbleOutline, 
  checkmarkCircle, chevronDown, chevronUp, closeOutline, createOutline, 
  documentTextOutline, helpCircleOutline, list, locationOutline, 
  paperPlane, personOutline, remove, add, saveOutline, sendOutline, 
  sparkles, timeOutline, walletOutline, warningOutline, alertCircle 
} from 'ionicons/icons';
import { OffersService } from 'src/app/services/offers.service';
import { ServiceService } from 'src/app/services/service.service';
import { UiEffectsService } from 'src/app/services/ui-effects.service';

// Animaciones Angular
import { animate, style, transition, trigger } from '@angular/animations';
import { TimeOption } from 'src/app/interface/time-option';

@Component({
  selector: 'app-make-offer-modal',
  templateUrl: './make-offer-modal.component.html',
  styleUrls: ['./make-offer-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, IonIcon, IonContent, CurrencyPipe
  ],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, height: 0, transform: 'translateY(-10px)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 1, height: '*', transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', 
          style({ opacity: 0, height: 0, transform: 'translateY(-10px)' }))
      ])
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class MakeOfferModalComponent implements OnInit {

  @Input() service: any;

  // Estado UI
  priceFocused = false;
  descFocused = false;
  isCustomTime = false;
  tipsExpanded = false;
  isSubmitting = false;

  // Formulario
  offerForm: FormGroup;
  
  timeOptions: TimeOption[] = [
    { value: '24 horas', label: '24 horas' },
    { value: '2-3 días', label: '2-3 días' },
    { value: '1 semana', label: '1 semana' },
    { value: '2 semanas', label: '2 semanas' },
    { value: '1 mes', label: '1 mes' },
  ];

  // Templates para descripción
  private templates = {
    experience: '\n\n💼 Experiencia relevante:\n- He completado proyectos similares con éxito\n- Especializado en este tipo de servicios desde hace X años\n',
    methodology: '\n\n🎯 Mi metodología:\n1. Análisis inicial de requerimientos\n2. Planificación detallada\n3. Ejecución con reportes de progreso\n4. Entrega y soporte post-servicio\n'
  };

  private modalCtrl = inject(ModalController);
  private fb = inject(FormBuilder);
  private _service = inject(ServiceService);
  private _offerService = inject(OffersService);
  private _ui = inject(UiEffectsService);

  constructor() {
    this.registerIcons();
    this.offerForm = this.createForm();
  }

  ngOnInit() {
    // Animar entrada del modal
    setTimeout(() => {
      this._ui.animateEntrance('.service-summary-card, .form-section', {
        duration: 500,
        delay: 100
      });
    }, 100);
  }

  private registerIcons() {
    addIcons({
      arrowBack, bulb, bulbOutline, cashOutline, chatbubbleOutline, 
      checkmarkCircle, chevronDown, chevronUp, closeOutline, createOutline,
      documentTextOutline, helpCircleOutline, list, locationOutline,
      paperPlane, personOutline, remove, add, saveOutline, sendOutline,
      sparkles, timeOutline, walletOutline, warningOutline, alertCircle
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      price: ['', [Validators.required, Validators.min(1)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]],
      estimated_time: ['', Validators.required]
    });
  }

  // ==========================================
  // MÉTODOS DE UI
  // ==========================================

  adjustPrice(amount: number) {
    this._ui.triggerHaptic('light');
    const current = this.offerForm.get('price')?.value || 0;
    const newValue = Math.max(0, current + amount);
    this.offerForm.patchValue({ price: newValue });
  }

  getBudgetPercentage(): number {
    const price = this.offerForm.get('price')?.value || 0;
    const min = this.service?.budget_min || 0;
    const max = this.service?.budget_max || 1;
    
    if (price <= min) return 0;
    if (price >= max) return 100;
    return ((price - min) / (max - min)) * 100;
  }

  isWithinBudget(): boolean {
    const price = this.offerForm.get('price')?.value || 0;
    return price >= (this.service?.budget_min || 0) && 
           price <= (this.service?.budget_max || Infinity);
  }

  getBudgetMessage(): string {
    const price = this.offerForm.get('price')?.value || 0;
    if (this.isWithinBudget()) {
      return 'Tu oferta está dentro del rango del cliente ✓';
    }
    if (price < this.service?.budget_min) {
      return 'Tu oferta es menor al presupuesto mínimo';
    }
    return 'Tu oferta supera el presupuesto máximo';
  }

  toggleCustomTime() {
    this.isCustomTime = !this.isCustomTime;
    if (!this.isCustomTime) {
      // Si está en opciones predefinidas, mantener valor
      const current = this.offerForm.get('estimated_time')?.value;
      const isPredefined = this.timeOptions.some(t => t.value === current);
      if (!isPredefined) {
        this.offerForm.patchValue({ estimated_time: '' });
      }
    }
    this._ui.triggerHaptic('light');
  }

  selectTime(value: string) {
    this._ui.triggerHaptic('light');
    const current = this.offerForm.get('estimated_time')?.value;
    this.offerForm.patchValue({ 
      estimated_time: current === value ? '' : value 
    });
    this.isCustomTime = false;
  }

  insertTemplate(type: 'experience' | 'methodology') {
    this._ui.triggerHaptic('light');
    const current = this.offerForm.get('description')?.value || '';
    this.offerForm.patchValue({ 
      description: current + this.templates[type] 
    });
  }

  getCharCount(): number {
    return this.offerForm.get('description')?.value?.length || 0;
  }

  getCharProgress(): string {
    return `${(this.getCharCount() / 500) * 100}%`;
  }

  getConfidenceScore(): number {
    let score = 0;
    const form = this.offerForm;
    
    if (form.get('price')?.valid) score += 30;
    if (form.get('description')?.valid && this.getCharCount() > 50) score += 40;
    if (form.get('estimated_time')?.valid) score += 30;
    
    return score;
  }

  showHelp() {
    // Mostrar ayuda o tutorial
    console.log('Show help');
  }

  saveDraft() {
    this._ui.triggerHaptic('medium');
    // Guardar en localStorage
    localStorage.setItem('offer_draft_' + this.service?.id, JSON.stringify(this.offerForm.value));
    this._service.presentToast('Borrador guardado');
  }

  // ==========================================
  // SUBMIT
  // ==========================================

  async submitOffer() {
    if (this.offerForm.invalid) {
      this._ui.triggerHaptic('heavy');
      this.offerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this._ui.triggerHaptic('medium');

    const loading = await this._service.presentLoading({ message: 'Enviando oferta...' });
    await loading.present();

    const offerData = {
      service_request_id: this.service?.id,
      price: this.offerForm.value.price,
      description: this.offerForm.value.description,
      estimated_time: this.offerForm.value.estimated_time
    };

    try {
      const response: any = await this._offerService.saveOffer(offerData);
      
      if (response.success) {
        this._ui.triggerHaptic('light');
        this.dismiss({ success: true, data: offerData });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      this.isSubmitting = false;
      this._service.presentToast('Error al enviar la oferta', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  dismiss(data?: any) {
    this.modalCtrl.dismiss(data);
  }
}