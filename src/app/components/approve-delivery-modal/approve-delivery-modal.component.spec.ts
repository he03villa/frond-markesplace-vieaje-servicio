import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { ApproveDeliveryModalComponent } from './approve-delivery-modal.component';
import { DeliveriesServices } from 'src/app/services/deliveries.service';

describe('ApproveDeliveryModalComponent', () => {
  let component: ApproveDeliveryModalComponent;
  let fixture: ComponentFixture<ApproveDeliveryModalComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let deliveriesServicesSpy: jasmine.SpyObj<DeliveriesServices>;

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    deliveriesServicesSpy = jasmine.createSpyObj('DeliveriesServices', ['respond']);

    TestBed.configureTestingModule({
      imports: [ApproveDeliveryModalComponent, FormsModule],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: DeliveriesServices, useValue: deliveriesServicesSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ApproveDeliveryModalComponent);
    component = fixture.componentInstance;
    component.deliveryId = 1;
    component.workerName = 'Worker';
    component.workerAvatar = 'avatar.jpg';
    component.completionNotes = 'Work done';
    component.actualHours = 5;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial state', () => {
    expect(component.rating).toBe(0);
    expect(component.isSubmitting).toBeFalse();
    expect(component.showConfetti).toBeFalse();
  });

  it('getRatingLabel returns default label when no rating set', () => {
    expect(component.getRatingLabel()).toBe('Selecciona una calificacion');
  });

  it('getRatingLabel returns correct label for rating', () => {
    component.rating = 4;
    expect(component.getRatingLabel()).toBe('Bueno');
  });

  it('getRatingEmoji returns correct emoji for rating', () => {
    component.rating = 5;
    expect(component.getRatingEmoji()).toBe('\ud83e\udd29');
  });

  it('getRatingEmoji returns default star when no rating', () => {
    expect(component.getRatingEmoji()).toBe('\u2b50');
  });

  it('getRatingColor returns correct color for rating', () => {
    component.rating = 1;
    expect(component.getRatingColor()).toBe('#ef4444');
  });

  it('getRatingColor returns default color when no rating', () => {
    expect(component.getRatingColor()).toBe('#94a3b8');
  });

  it('setRating sets rating and triggers confetti for 5 stars', fakeAsync(() => {
    component.setRating(5);
    expect(component.rating).toBe(5);
    expect(component.showConfetti).toBeTrue();
    tick(2000);
    expect(component.showConfetti).toBeFalse();
  }));

  it('setRating sets rating without confetti for non-5 stars', () => {
    component.setRating(4);
    expect(component.rating).toBe(4);
    expect(component.showConfetti).toBeFalse();
  });

  it('dismiss calls modalCtrl.dismiss with data', () => {
    component.dismiss({ key: 'value' });
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({ key: 'value' });
  });

  it('submit does nothing when rating is 0', async () => {
    await component.submit();
    expect(deliveriesServicesSpy.respond).not.toHaveBeenCalled();
  });

  it('submit calls deliveriesServices.respond and dismisses on success', async () => {
    component.setRating(4);
    component.comment = 'Great job';
    component.feedback = 'Loved it';
    deliveriesServicesSpy.respond.and.returnValue(Promise.resolve({ success: true }));

    await component.submit();
    expect(deliveriesServicesSpy.respond).toHaveBeenCalledWith(1, {
      action: 'approve',
      rating: 4,
      comment: 'Great job',
      feedback: 'Loved it'
    });
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({ approved: true, data: { success: true } });
  });

  it('submit sends null for empty comment and feedback', async () => {
    component.setRating(3);
    deliveriesServicesSpy.respond.and.returnValue(Promise.resolve({ success: true }));

    await component.submit();
    expect(deliveriesServicesSpy.respond).toHaveBeenCalledWith(1, {
      action: 'approve',
      rating: 3,
      comment: null,
      feedback: null
    });
  });

  it('submit sets isSubmitting false on error', async () => {
    component.setRating(3);
    deliveriesServicesSpy.respond.and.returnValue(Promise.reject(new Error('fail')));

    await component.submit();
    expect(component.isSubmitting).toBeFalse();
  });
});
