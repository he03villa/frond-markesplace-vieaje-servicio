import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MyRidesPage } from './my-rides.page';
import { ServiceService } from 'src/app/services/service.service';
import { RidesService } from 'src/app/services/rides.service';
import { ActionSheetController } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';

describe('MyRidesPage', () => {
  let component: MyRidesPage;
  let fixture: ComponentFixture<MyRidesPage>;
  let serviceSpy: jasmine.SpyObj<ServiceService>;
  let ridesSpy: jasmine.SpyObj<RidesService>;
  let actionSheetSpy: jasmine.SpyObj<ActionSheetController>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  const mockResponse = {
    success: true,
    data: {
      rides: [{ id: 1, origin: 'A', destination: 'B', status: 'upcoming', statusLabel: 'Próximo', seatsTotal: 4, seatsAvailable: 2, publishable_id: 10 }],
      stats: { upcoming: 1, completed: 0, cancelled: 0, total_passengers: 0, total_earnings: 0, in_progress: 0, total: 1 }
    }
  };

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ServiceService', ['url', 'Toast']);
    ridesSpy = jasmine.createSpyObj('RidesService', ['getMyRides']);
    actionSheetSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);

    ridesSpy.getMyRides.and.resolveTo(mockResponse);
    actionSheetSpy.create.and.resolveTo({ present: () => Promise.resolve() } as any);

    await TestBed.configureTestingModule({
      imports: [MyRidesPage],
      providers: [
        { provide: ServiceService, useValue: serviceSpy },
        { provide: RidesService, useValue: ridesSpy },
        { provide: ActionSheetController, useValue: actionSheetSpy },
        { provide: ModalController, useValue: modalCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyRidesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load rides on init', fakeAsync(() => {
    component.loadRides();
    tick();
    expect(ridesSpy.getMyRides).toHaveBeenCalledWith({ status: 'all', page: 1 });
    expect(component.rides.length).toBe(1);
    expect(component.isLoading).toBe(false);
  }));

  it('should navigate back', () => {
    component.back();
    expect(serviceSpy.url).toHaveBeenCalledWith('/home');
  });

  it('should set tab and apply filters', () => {
    spyOn(component, 'applyFilters');
    component.setTab('completed');
    expect(component.activeTab).toBe('completed');
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should open actions sheet', fakeAsync(() => {
    const ride = { id: 1, origin: 'A', destination: 'B', publishable_id: 10 } as any;
    component.openActions(ride);
    tick();
    expect(actionSheetSpy.create).toHaveBeenCalled();
  }));

  it('should navigate to view ride', () => {
    component.viewRide(5);
    expect(serviceSpy.url).toHaveBeenCalledWith('/home/5/ride-detail');
  });

  it('should navigate to create ride', () => {
    component.createRide();
    expect(serviceSpy.url).toHaveBeenCalledWith('/create-ride');
  });

  it('should calculate occupancy rate', () => {
    const ride = { seatsTotal: 4, seatsAvailable: 1 } as any;
    expect(component.getOccupancyRate(ride)).toBe(75);
  });

  it('should return status color', () => {
    expect(component.getStatusColor('upcoming')).toBe('#3b82f6');
    expect(component.getStatusColor('completed')).toBe('#10b981');
    expect(component.getStatusColor('cancelled')).toBe('#ef4444');
    expect(component.getStatusColor('in-progress')).toBe('#f59e0b');
  });

  it('should update headerSolid on scroll', () => {
    component.onScroll({ detail: { scrollTop: 100 } });
    expect(component.headerSolid).toBe(true);
    component.onScroll({ detail: { scrollTop: 50 } });
    expect(component.headerSolid).toBe(false);
  });

  it('should handle refresh', fakeAsync(() => {
    const ev = jasmine.createSpyObj('ev', ['target']);
    ev.target = jasmine.createSpyObj('target', ['complete']);
    component.handleRefresh(ev);
    tick();
    expect(ev.target.complete).toHaveBeenCalled();
  }));
});
