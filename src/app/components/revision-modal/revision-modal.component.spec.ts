import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { RevisionModalComponent } from './revision-modal.component';
import { DeliveriesServices } from 'src/app/services/deliveries.service';

describe('RevisionModalComponent', () => {
  let component: RevisionModalComponent;
  let fixture: ComponentFixture<RevisionModalComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let deliveriesServicesSpy: jasmine.SpyObj<DeliveriesServices>;

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    deliveriesServicesSpy = jasmine.createSpyObj('DeliveriesServices', ['respond']);

    TestBed.configureTestingModule({
      imports: [RevisionModalComponent, FormsModule],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: DeliveriesServices, useValue: deliveriesServicesSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RevisionModalComponent);
    component = fixture.componentInstance;
    component.deliveryId = 1;
    component.workerName = 'Worker';
    component.workerAvatar = 'avatar.jpg';
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial state', () => {
    expect(component.feedback).toBe('');
    expect(component.isSubmitting).toBeFalse();
  });

  it('should have predefined quick reasons', () => {
    expect(component.quickReasons.length).toBeGreaterThan(0);
    expect(component.quickReasons[0]).toBe('El trabajo no cumple con lo acordado');
  });

  it('selectReason sets feedback', () => {
    component.selectReason('Needs adjustments');
    expect(component.feedback).toBe('Needs adjustments');
  });

  it('dismiss calls modalCtrl.dismiss with data', () => {
    component.dismiss({ key: 'value' });
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({ key: 'value' });
  });

  it('dismiss calls modalCtrl.dismiss without data by default', () => {
    component.dismiss();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(undefined);
  });

  it('submit does nothing when feedback is empty', async () => {
    await component.submit();
    expect(deliveriesServicesSpy.respond).not.toHaveBeenCalled();
  });

  it('submit does nothing when isSubmitting is true', async () => {
    component.feedback = 'Needs work';
    component.isSubmitting = true;
    await component.submit();
    expect(deliveriesServicesSpy.respond).not.toHaveBeenCalled();
  });

  it('submit calls deliveriesServices.respond and dismisses on success', async () => {
    component.feedback = 'Needs more details';
    deliveriesServicesSpy.respond.and.returnValue(Promise.resolve({ success: true }));

    await component.submit();
    expect(deliveriesServicesSpy.respond).toHaveBeenCalledWith(1, { action: 'revision', feedback: 'Needs more details' });
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({ revised: true, data: { success: true } });
  });

  it('submit resets isSubmitting on error', async () => {
    component.feedback = 'Needs work';
    deliveriesServicesSpy.respond.and.returnValue(Promise.reject(new Error('fail')));

    await component.submit();
    expect(component.isSubmitting).toBeFalse();
  });

  it('submit sends trimmed feedback', async () => {
    component.feedback = '  Needs work  ';
    deliveriesServicesSpy.respond.and.returnValue(Promise.resolve({ success: true }));

    await component.submit();
    expect(deliveriesServicesSpy.respond).toHaveBeenCalledWith(1, { action: 'revision', feedback: 'Needs work' });
  });

  it('submit sets isSubmitting before API call', async () => {
    component.feedback = 'Needs work';
    deliveriesServicesSpy.respond.and.callFake(() => {
      expect(component.isSubmitting).toBeTrue();
      return Promise.resolve({ success: true });
    });
    await component.submit();
  });
});
