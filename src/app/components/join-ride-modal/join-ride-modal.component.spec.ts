import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { JoinRideModalComponent } from './join-ride-modal.component';

describe('JoinRideModalComponent', () => {
  let component: JoinRideModalComponent;
  let fixture: ComponentFixture<JoinRideModalComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);

    TestBed.configureTestingModule({
      imports: [JoinRideModalComponent, FormsModule],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JoinRideModalComponent);
    component = fixture.componentInstance;
    component.rideId = '1';
    component.maxSeats = 4;
    component.ridePrice = 50;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial state', () => {
    expect(component.seats).toBe(1);
    expect(component.showSummary).toBeFalse();
    expect(component.isSubmitting).toBeFalse();
    expect(component.activeField).toBeNull();
  });

  it('availableSeatsArray returns array of length maxSeats', () => {
    expect(component.availableSeatsArray).toEqual([1, 2, 3, 4]);
  });

  it('isSeatFilled returns true when n <= seats', () => {
    component.seats = 2;
    expect(component.isSeatFilled(1)).toBeTrue();
    expect(component.isSeatFilled(2)).toBeTrue();
    expect(component.isSeatFilled(3)).toBeFalse();
  });

  it('selectSeat sets seats if within range', () => {
    component.selectSeat(3);
    expect(component.seats).toBe(3);
  });

  it('selectSeat does not set seats if exceeding maxSeats', () => {
    component.selectSeat(10);
    expect(component.seats).toBe(1);
  });

  it('toggleSummary toggles showSummary', () => {
    expect(component.showSummary).toBeFalse();
    component.toggleSummary();
    expect(component.showSummary).toBeTrue();
    component.toggleSummary();
    expect(component.showSummary).toBeFalse();
  });

  it('getTotal returns seats times ridePrice', () => {
    component.seats = 2;
    expect(component.getTotal()).toBe(100);
  });

  it('onFieldFocus sets activeField', () => {
    component.onFieldFocus('pickup');
    expect(component.activeField).toBe('pickup');
  });

  it('onFieldBlur clears activeField', () => {
    component.activeField = 'pickup';
    component.onFieldBlur();
    expect(component.activeField).toBeNull();
  });

  it('dismiss calls modalCtrl.dismiss with data', () => {
    component.dismiss({ data: 'test' });
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({ data: 'test' });
  });

  it('confirm does nothing when isSubmitting is true', async () => {
    component.isSubmitting = true;
    await component.confirm();
    expect(modalCtrlSpy.dismiss).not.toHaveBeenCalled();
  });

  it('confirm dismisses with ride data after delay', async () => {
    component.seats = 2;
    component.pickupLocation = 'Origin';
    component.dropoffLocation = 'Dest';
    component.specialRequests = 'Window seat';

    await component.confirm();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({
      seats: 2,
      pickupLocation: 'Origin',
      dropoffLocation: 'Dest',
      specialRequests: 'Window seat'
    });
  });

  it('confirm sets isSubmitting to true during process', async () => {
    component.seats = 1;
    const promise = component.confirm();
    expect(component.isSubmitting).toBeTrue();
    await promise;
  });
});
