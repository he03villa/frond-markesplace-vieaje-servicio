import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { RejectModalComponent } from './reject-modal.component';
import { DeliveriesServices } from 'src/app/services/deliveries.service';

describe('RejectModalComponent', () => {
  let component: RejectModalComponent;
  let fixture: ComponentFixture<RejectModalComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let deliveriesServicesSpy: jasmine.SpyObj<DeliveriesServices>;

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    deliveriesServicesSpy = jasmine.createSpyObj('DeliveriesServices', ['respond']);

    TestBed.configureTestingModule({
      imports: [RejectModalComponent, FormsModule],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: DeliveriesServices, useValue: deliveriesServicesSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RejectModalComponent);
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
    expect(component.reason).toBe('');
    expect(component.isSubmitting).toBeFalse();
    expect(component.confirmed).toBeFalse();
  });

  it('should have predefined reject reasons', () => {
    expect(component.rejectReasons.length).toBeGreaterThan(0);
    expect(component.rejectReasons[0]).toBe('El trabajo no fue realizado');
  });

  it('selectReason sets the reason', () => {
    component.selectReason('La calidad es muy baja');
    expect(component.reason).toBe('La calidad es muy baja');
  });

  it('dismiss calls modalCtrl.dismiss with data', () => {
    component.dismiss({ key: 'value' });
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({ key: 'value' });
  });

  it('dismiss calls modalCtrl.dismiss without data by default', () => {
    component.dismiss();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(undefined);
  });

  it('submit does nothing when reason is empty', async () => {
    await component.submit();
    expect(deliveriesServicesSpy.respond).not.toHaveBeenCalled();
  });

  it('submit does nothing when not confirmed', async () => {
    component.reason = 'Bad quality';
    await component.submit();
    expect(deliveriesServicesSpy.respond).not.toHaveBeenCalled();
  });

  it('submit does nothing when isSubmitting is true', async () => {
    component.reason = 'Bad quality';
    component.confirmed = true;
    component.isSubmitting = true;
    await component.submit();
    expect(deliveriesServicesSpy.respond).not.toHaveBeenCalled();
  });

  it('submit calls deliveriesServices.respond and dismisses on success', async () => {
    component.reason = 'Bad quality';
    component.confirmed = true;
    deliveriesServicesSpy.respond.and.returnValue(Promise.resolve({ success: true }));

    await component.submit();
    expect(deliveriesServicesSpy.respond).toHaveBeenCalledWith(1, { action: 'reject', feedback: 'Bad quality' });
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({ rejected: true, data: { success: true } });
  });

  it('submit resets isSubmitting on error', async () => {
    component.reason = 'Bad quality';
    component.confirmed = true;
    deliveriesServicesSpy.respond.and.returnValue(Promise.reject(new Error('fail')));

    await component.submit();
    expect(component.isSubmitting).toBeFalse();
  });

  it('submit sends trimmed feedback', async () => {
    component.reason = '  Bad quality  ';
    component.confirmed = true;
    deliveriesServicesSpy.respond.and.returnValue(Promise.resolve({ success: true }));

    await component.submit();
    expect(deliveriesServicesSpy.respond).toHaveBeenCalledWith(1, { action: 'reject', feedback: 'Bad quality' });
  });
});
