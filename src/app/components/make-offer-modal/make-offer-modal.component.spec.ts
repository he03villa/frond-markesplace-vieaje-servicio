import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { MakeOfferModalComponent } from './make-offer-modal.component';
import { OffersService } from 'src/app/services/offers.service';
import { ServiceService } from 'src/app/services/service.service';
import { UiEffectsService } from 'src/app/services/ui-effects.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('MakeOfferModalComponent', () => {
  let component: MakeOfferModalComponent;
  let fixture: ComponentFixture<MakeOfferModalComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let offersServiceSpy: jasmine.SpyObj<OffersService>;
  let serviceServiceSpy: jasmine.SpyObj<ServiceService>;
  let uiEffectsServiceSpy: jasmine.SpyObj<UiEffectsService>;

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    offersServiceSpy = jasmine.createSpyObj('OffersService', ['saveOffer']);
    serviceServiceSpy = jasmine.createSpyObj('ServiceService', ['presentToast', 'presentLoading', 'formValidate', 'Alert', 'addLoading', 'removeLoading']);
    uiEffectsServiceSpy = jasmine.createSpyObj('UiEffectsService', ['animateEntrance', 'triggerHaptic']);

    const loadingMock = { present: jasmine.createSpy('present').and.returnValue(Promise.resolve()), dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve()) };
    serviceServiceSpy.presentLoading.and.returnValue(Promise.resolve(loadingMock as any));
    uiEffectsServiceSpy.animateEntrance.and.returnValue(Promise.resolve());
    uiEffectsServiceSpy.triggerHaptic.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      imports: [
        MakeOfferModalComponent,
        ReactiveFormsModule,
        FormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: OffersService, useValue: offersServiceSpy },
        { provide: ServiceService, useValue: serviceServiceSpy },
        { provide: UiEffectsService, useValue: uiEffectsServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MakeOfferModalComponent);
    component = fixture.componentInstance;
    component.service = { id: 1, budget_min: 100, budget_max: 500 };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the offer form', () => {
    expect(component.offerForm).toBeDefined();
    expect(component.offerForm.contains('price')).toBeTrue();
    expect(component.offerForm.contains('description')).toBeTrue();
    expect(component.offerForm.contains('estimated_time')).toBeTrue();
  });

  it('form should be invalid when empty', () => {
    expect(component.offerForm.valid).toBeFalse();
  });

  it('adjustPrice increases price', () => {
    component.offerForm.patchValue({ price: 100 });
    component.adjustPrice(50);
    expect(component.offerForm.get('price')?.value).toBe(150);
    expect(uiEffectsServiceSpy.triggerHaptic).toHaveBeenCalledWith('light');
  });

  it('adjustPrice decreases price but not below 0', () => {
    component.offerForm.patchValue({ price: 30 });
    component.adjustPrice(-50);
    expect(component.offerForm.get('price')?.value).toBe(0);
  });

  it('getBudgetPercentage returns 0 when price <= min', () => {
    component.offerForm.patchValue({ price: 50 });
    expect(component.getBudgetPercentage()).toBe(0);
  });

  it('getBudgetPercentage returns 100 when price >= max', () => {
    component.offerForm.patchValue({ price: 600 });
    expect(component.getBudgetPercentage()).toBe(100);
  });

  it('getBudgetPercentage returns percentage within range', () => {
    component.offerForm.patchValue({ price: 300 });
    expect(component.getBudgetPercentage()).toBe(50);
  });

  it('isWithinBudget returns true when price is within range', () => {
    component.offerForm.patchValue({ price: 300 });
    expect(component.isWithinBudget()).toBeTrue();
  });

  it('isWithinBudget returns false when price is below minimum', () => {
    component.offerForm.patchValue({ price: 50 });
    expect(component.isWithinBudget()).toBeFalse();
  });

  it('getBudgetMessage returns correct message for each scenario', () => {
    component.offerForm.patchValue({ price: 300 });
    expect(component.getBudgetMessage()).toContain('dentro del rango');

    component.offerForm.patchValue({ price: 50 });
    expect(component.getBudgetMessage()).toContain('menor al presupuesto mínimo');

    component.offerForm.patchValue({ price: 1000 });
    expect(component.getBudgetMessage()).toContain('supera el presupuesto máximo');
  });

  it('toggleCustomTime toggles isCustomTime', () => {
    expect(component.isCustomTime).toBeFalse();
    component.toggleCustomTime();
    expect(component.isCustomTime).toBeTrue();
    component.toggleCustomTime();
    expect(component.isCustomTime).toBeFalse();
  });

  it('selectTime sets estimated_time and closes custom time', () => {
    component.selectTime('2-3 días');
    expect(component.offerForm.get('estimated_time')?.value).toBe('2-3 días');
    expect(component.isCustomTime).toBeFalse();
  });

  it('selectTime toggles off already selected value', () => {
    component.selectTime('1 semana');
    component.selectTime('1 semana');
    expect(component.offerForm.get('estimated_time')?.value).toBe('');
  });

  it('insertTemplate appends template to description', () => {
    component.offerForm.patchValue({ description: 'Base text' });
    component.insertTemplate('experience');
    expect(component.offerForm.get('description')?.value).toContain('Base text');
    expect(component.offerForm.get('description')?.value).toContain('Experiencia relevante');
    expect(uiEffectsServiceSpy.triggerHaptic).toHaveBeenCalledWith('light');
  });

  it('getCharCount returns description length', () => {
    expect(component.getCharCount()).toBe(0);
    component.offerForm.patchValue({ description: '12345' });
    expect(component.getCharCount()).toBe(5);
  });

  it('getCharProgress returns correct percentage string', () => {
    component.offerForm.patchValue({ description: '1'.repeat(250) });
    expect(component.getCharProgress()).toBe('50%');
  });

  it('getConfidenceScore returns 0 when form is empty', () => {
    expect(component.getConfidenceScore()).toBe(0);
  });

  it('getConfidenceScore returns max when form is fully valid', () => {
    component.offerForm.patchValue({
      price: 200,
      description: 'A'.repeat(60),
      estimated_time: '1 semana'
    });
    expect(component.getConfidenceScore()).toBe(100);
  });

  it('saveDraft stores in localStorage and shows toast', () => {
    spyOn(localStorage, 'setItem');
    component.service = { id: 5, budget_min: 0, budget_max: 1000 };
    component.saveDraft();
    expect(localStorage.setItem).toHaveBeenCalledWith('offer_draft_5', jasmine.any(String));
    expect(serviceServiceSpy.presentToast).toHaveBeenCalledWith('Borrador guardado');
    expect(uiEffectsServiceSpy.triggerHaptic).toHaveBeenCalledWith('medium');
  });

  it('submitOffer marks all as touched on invalid form', async () => {
    spyOn(component.offerForm, 'markAllAsTouched');
    await component.submitOffer();
    expect(uiEffectsServiceSpy.triggerHaptic).toHaveBeenCalledWith('heavy');
    expect(component.offerForm.markAllAsTouched).toHaveBeenCalled();
    expect(offersServiceSpy.saveOffer).not.toHaveBeenCalled();
  });

  it('submitOffer calls saveOffer on valid form and dismisses on success', async () => {
    component.offerForm.patchValue({
      price: 200,
      description: 'I can do this work very well and efficiently',
      estimated_time: '2-3 días'
    });
    offersServiceSpy.saveOffer.and.returnValue(Promise.resolve({ success: true }));

    await component.submitOffer();
    expect(offersServiceSpy.saveOffer).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({ success: true, data: jasmine.any(Object) });
  });

  it('submitOffer sets isSubmitting false and shows error toast on failure', async () => {
    component.offerForm.patchValue({
      price: 200,
      description: 'I can do this work very well and efficiently',
      estimated_time: '2-3 días'
    });
    offersServiceSpy.saveOffer.and.returnValue(Promise.reject(new Error('fail')));

    await component.submitOffer();
    expect(component.isSubmitting).toBeFalse();
    expect(serviceServiceSpy.presentToast).toHaveBeenCalledWith('Error al enviar la oferta', 'danger');
  });

  it('dismiss calls modalCtrl.dismiss', () => {
    component.dismiss({ data: 'test' });
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({ data: 'test' });
  });
});
