import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RideDetailPage } from './ride-detail.page';
import { ServiceService } from 'src/app/services/service.service';
import { AuthService } from 'src/app/services/auth.service';
import { RidesService } from 'src/app/services/rides.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { ModalController } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';

describe('RideDetailPage', () => {
  let component: RideDetailPage;
  let fixture: ComponentFixture<RideDetailPage>;
  let serviceSpy: jasmine.SpyObj<ServiceService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let ridesSpy: jasmine.SpyObj<RidesService>;
  let wsSpy: jasmine.SpyObj<WebsocketService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  const mockRide = {
    id: 1,
    driver: { id: 2, name: 'Driver', phone: '123456789' },
    seats: { available: 3, price_per_seat: 100 },
    status: 'available',
    timeline: [
      { label: 'Salida', done: true },
      { label: 'En camino', done: false },
      { label: 'Llegada', done: false }
    ],
    route: { distance_km: 10 },
    schedule: { departure_time: new Date(Date.now() + 3600000).toISOString() },
    meta: { can_join: true, my_status: null, is_driver: false, my_seats: 0 },
    passengers: []
  };

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ServiceService', ['url', 'Alert', 'presentLoading', 'presentToast']);
    authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    ridesSpy = jasmine.createSpyObj('RidesService', [
      'getRide', 'saveJoinRide', 'saveCancel', 'saveStart', 'savePassenger',
      'savePickup', 'saveDropoff', 'saveComplete', 'saveRate'
    ]);
    wsSpy = jasmine.createSpyObj('WebsocketService', ['isConnected', 'connect', 'leaveChannel', 'listenToRide', 'listenToUserNotifications']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);

    authSpy.getCurrentUser.and.returnValue({ id: 1, name: 'Me' });
    ridesSpy.getRide.and.resolveTo({ success: true, data: mockRide });
    serviceSpy.presentLoading.and.resolveTo({ present: () => Promise.resolve(), dismiss: () => Promise.resolve(true) } as any);
    wsSpy.isConnected.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [RideDetailPage],
      providers: [
        { provide: ServiceService, useValue: serviceSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: RidesService, useValue: ridesSpy },
        { provide: WebsocketService, useValue: wsSpy },
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RideDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set rideId from route on creation', () => {
    expect(component.rideId).toBe(1);
  });

  it('should load ride on init', fakeAsync(() => {
    component.loadRide();
    tick();
    expect(ridesSpy.getRide).toHaveBeenCalledWith(1);
    expect(component.ride).toEqual(mockRide);
  }));

  it('should connect to WebSocket on load', () => {
    component.connectToRealtimeUpdates(1);
    expect(wsSpy.listenToRide).toHaveBeenCalledWith(1, jasmine.any(Function));
  });

  it('should navigate back', () => {
    component.goBack();
    expect(serviceSpy.url).toHaveBeenCalledWith('/home');
  });

  it('should chat with driver', () => {
    component.ride = { driver: { id: 3 } };
    component.chatDriver();
    expect(serviceSpy.url).toHaveBeenCalledWith('/home/3/chat-conversation-users');
  });

  it('should reload ride', fakeAsync(() => {
    component.reloadRide();
    tick();
    expect(ridesSpy.getRide).toHaveBeenCalledWith(1);
  }));

  it('should get timeline progress', () => {
    component.ride = {
      timeline: [
        { label: 'A', done: true },
        { label: 'B', done: false },
        { label: 'C', done: false }
      ]
    };
    expect(component.getTimelineProgress()).toBe(50);
  });

  it('should identify current step', () => {
    component.ride = {
      timeline: [
        { label: 'A', done: true },
        { label: 'B', done: false },
        { label: 'C', done: false }
      ]
    };
    expect(component.isCurrentStep(0)).toBe(false);
    expect(component.isCurrentStep(1)).toBe(true);
    expect(component.isCurrentStep(2)).toBe(false);
  });

  it('should return status label', () => {
    expect(component.statusLabel('available')).toBe('Disponible');
    expect(component.statusLabel('in_progress')).toBe('En curso');
    expect(component.statusLabel('completed')).toBe('Completado');
    expect(component.statusLabel('cancelled')).toBe('Cancelado');
  });

  it('should get estimated arrival time', () => {
    component.ride = {
      schedule: { departure_time: new Date().toISOString() },
      route: { distance_km: 10 }
    };
    const arrival = component.getEstimatedArrival();
    expect(arrival).toBeTruthy();
  });

  it('should identify my seat', () => {
    component.ride = { meta: { my_status: 'confirmed', my_seats: 2 } };
    expect(component.isMySeat(0)).toBe(true);
    expect(component.isMySeat(2)).toBe(false);
  });

  it('should get action context', () => {
    component.ride = { meta: { can_join: true } };
    expect(component.getActionContext()).toBe('join');

    component.ride = { meta: { can_join: false, my_status: 'pending' } };
    expect(component.getActionContext()).toBe('waiting');

    component.ride = { meta: { can_join: false, my_status: 'confirmed' } };
    expect(component.getActionContext()).toBe('confirmed');

    component.ride = { meta: { can_join: false, my_status: 'picked_up' } };
    expect(component.getActionContext()).toBe('inprogress');

    component.ride = { meta: { can_join: false, my_status: null, can_start: true } };
    expect(component.getActionContext()).toBe('start');

    component.ride = { meta: { can_join: false, my_status: null, can_start: false, can_complete: true } };
    expect(component.getActionContext()).toBe('complete');
  });

  it('should set rating', () => {
    component.setRating(4);
    expect(component.myRating).toBe(4);
  });

  it('should submit rating', fakeAsync(() => {
    component.ride = { id: 1, driver: { id: 2 } };
    component.myRating = 4;
    ridesSpy.saveRate.and.resolveTo({ success: true });
    component.submitRating();
    tick();
    expect(ridesSpy.saveRate).toHaveBeenCalledWith(1, { target_user_id: 2, rating: 4, comment: '' });
  }));
});
