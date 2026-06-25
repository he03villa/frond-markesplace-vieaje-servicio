import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { InitiatePage } from './initiate.page';
import { ServiceService } from 'src/app/services/service.service';
import { ServiceRequestsService } from 'src/app/services/service-requests.service';
import { RidesService } from 'src/app/services/rides.service';
import { LocationService } from 'src/app/services/location.service';
import { PublicationsService } from 'src/app/services/publications.service';
import { UiEffectsService } from 'src/app/services/ui-effects.service';
import { MyAssignmentsService } from 'src/app/services/my-assignments.service';
import { AuthService } from 'src/app/services/auth.service';
import { ReviewsService } from 'src/app/services/reviews.service';
import { ModalController, AnimationController } from '@ionic/angular/standalone';

describe('InitiatePage', () => {
  let component: InitiatePage;
  let fixture: ComponentFixture<InitiatePage>;
  let serviceSpy: jasmine.SpyObj<ServiceService>;
  let srSpy: jasmine.SpyObj<ServiceRequestsService>;
  let ridesSpy: jasmine.SpyObj<RidesService>;
  let locationSpy: jasmine.SpyObj<LocationService>;
  let pubSpy: jasmine.SpyObj<PublicationsService>;
  let uiSpy: jasmine.SpyObj<UiEffectsService>;
  let assignSpy: jasmine.SpyObj<MyAssignmentsService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let reviewSpy: jasmine.SpyObj<ReviewsService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  const mockServicesResponse = { success: true, data: { data: [{ id: 1, title: 'Service 1', type: 'service' }] } };
  const mockRidesResponse = { success: true, data: { data: [{ id: 1, origin: 'A', destination: 'B' }] } };
  const mockSummaryResponse = { success: true, data: { summary: { total: 5 } } };
  const mockAssignmentsResponse = {
    success: true,
    data: {
      data: {
        assignments: [
          { id: '1', type: 'service', role: 'worker', status: 'active', title: 'Fix plumbing', description: '', price: 100, created_at: new Date().toISOString(), ui: {} }
        ],
        counts: { services_active: 1, trips_as_driver: 0, trips_as_passenger: 0, total_active: 1 }
      }
    }
  };
  const mockPublicationsResponse = { success: true, data: { data: [{ id: 1, title: 'Pub 1', type: 'service' }] } };

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ServiceService', ['url', 'presentLoading', 'presentToast', 'Toast', 'Alert', 'openModal']);
    srSpy = jasmine.createSpyObj('ServiceRequestsService', ['getAllRequests']);
    ridesSpy = jasmine.createSpyObj('RidesService', ['getAllRides']);
    locationSpy = jasmine.createSpyObj('LocationService', ['getCurrentPosition']);
    pubSpy = jasmine.createSpyObj('PublicationsService', ['getMyPublicationsSummary', 'getMyPublications']);
    uiSpy = jasmine.createSpyObj('UiEffectsService', [
      'cleanupComponent', 'animateCounters', 'initOrbitalTabs', 'initScrollEffects',
      'initMorphingFAB', 'initMenuMorph', 'initPullToRefresh', 'triggerHaptic',
      'animateEntrance', 'pulseElement'
    ]);
    assignSpy = jasmine.createSpyObj('MyAssignmentsService', ['getMyAssignments', 'getMyServicesAsWorker', 'getMyRidesAsDriver', 'getMyRidesAsPassenger']);
    authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'me']);
    reviewSpy = jasmine.createSpyObj('ReviewsService', ['getUsersReviews']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);

    authSpy.getCurrentUser.and.returnValue({ id: 1, name: 'Me', count_reviews: 0, rating: 0 });
    authSpy.me.and.resolveTo({ success: true, data: { count_reviews: 5, rating: 4.5 } });
    srSpy.getAllRequests.and.resolveTo(mockServicesResponse);
    ridesSpy.getAllRides.and.resolveTo(mockRidesResponse);
    pubSpy.getMyPublicationsSummary.and.resolveTo(mockSummaryResponse);
    pubSpy.getMyPublications.and.resolveTo(mockPublicationsResponse);
    assignSpy.getMyAssignments.and.resolveTo(mockAssignmentsResponse);
    serviceSpy.presentLoading.and.resolveTo({ present: () => Promise.resolve(), dismiss: () => Promise.resolve(true) } as any);
    locationSpy.getCurrentPosition.and.resolveTo({ lat: -34.6037, lng: -58.3816 });

    await TestBed.configureTestingModule({
      imports: [InitiatePage],
      providers: [
        { provide: ServiceService, useValue: serviceSpy },
        { provide: ServiceRequestsService, useValue: srSpy },
        { provide: RidesService, useValue: ridesSpy },
        { provide: LocationService, useValue: locationSpy },
        { provide: PublicationsService, useValue: pubSpy },
        { provide: UiEffectsService, useValue: uiSpy },
        { provide: MyAssignmentsService, useValue: assignSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ReviewsService, useValue: reviewSpy },
        { provide: ModalController, useValue: modalCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InitiatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data on init', fakeAsync(() => {
    component.cargarUser();
    tick();
    expect(authSpy.me).toHaveBeenCalled();
    expect(component.currentUser.count_reviews).toBe(5);
  }));

  it('should load services on init', fakeAsync(() => {
    component.cargarServices();
    tick();
    expect(srSpy.getAllRequests).toHaveBeenCalled();
    expect(component.arrayServicesRequets.length).toBe(1);
  }));

  it('should load summary on init', fakeAsync(() => {
    component.cargarsummary();
    tick();
    expect(pubSpy.getMyPublicationsSummary).toHaveBeenCalled();
  }));

  it('should load rides', fakeAsync(() => {
    component.cargarRides();
    tick();
    expect(ridesSpy.getAllRides).toHaveBeenCalled();
    expect(component.arrayRides.length).toBe(1);
  }));

  it('should load assignments', fakeAsync(() => {
    component.cargarAssignments();
    tick();
    expect(assignSpy.getMyAssignments).toHaveBeenCalled();
    expect(component.assignments.length).toBe(1);
    expect(component.activeAssignmentsCount).toBe(1);
  }));

  it('should switch tab and load data', fakeAsync(() => {
    component.switchTab('rides');
    tick();
    expect(component.activeTab).toBe('rides');
    expect(uiSpy.triggerHaptic).toHaveBeenCalledWith('light');
  }));

  it('should switch tab to my-services and load publications', fakeAsync(() => {
    component.switchTab('my-services');
    tick();
    expect(component.activeTab).toBe('my-services');
    expect(pubSpy.getMyPublications).toHaveBeenCalled();
  }));

  it('should switch my services sub tab', fakeAsync(() => {
    component.switchMyServicesSubTab('assignments');
    tick();
    expect(component.myServicesSubTab).toBe('assignments');
    expect(uiSpy.triggerHaptic).toHaveBeenCalledWith('light');
  }));

  it('should set assignment filter', fakeAsync(() => {
    component.setAssignmentFilter('driver');
    tick();
    expect(component.assignmentFilter).toBe('driver');
    expect(uiSpy.triggerHaptic).toHaveBeenCalledWith('light');
  }));

  it('should filter publications', fakeAsync(async () => {
    component.publications = [{ id: 1, type: 'service' }, { id: 2, type: 'ride' }];
    await component.filterPublications('service');
    expect(component.publicationFilter).toBe('service');
    expect(component.filteredPublications.length).toBe(1);
  }));

  it('should refresh data', fakeAsync(() => {
    component.refreshData();
    tick();
    expect(srSpy.getAllRequests).toHaveBeenCalled();
  }));

  it('should open assignment detail for service', fakeAsync(() => {
    const assignment = { id: '1', type: 'service' } as any;
    component.openAssignmentDetail(assignment);
    tick();
    expect(uiSpy.triggerHaptic).toHaveBeenCalledWith('light');
    expect(serviceSpy.url).toHaveBeenCalledWith('/home/1/service-detail');
  }));

  it('should open assignment detail for trip', fakeAsync(() => {
    spyOn(component, 'viewRide');
    const assignment = { id: '2', type: 'trip' } as any;
    component.openAssignmentDetail(assignment);
    tick();
    expect(component.viewRide).toHaveBeenCalledWith(2);
  }));

  it('should accept assignment', fakeAsync(() => {
    serviceSpy.Alert.and.resolveTo();
    const assignment = { id: '1', type: 'service', role: 'worker', status: 'pending', title: 'Test' } as any;
    component.acceptAssignment(assignment);
    tick();
    expect(serviceSpy.Alert).toHaveBeenCalled();
  }));

  it('should complete assignment and update counts', fakeAsync(() => {
    component.assignments = [
      { id: '1', type: 'service', role: 'worker', status: 'active' } as any,
      { id: '2', type: 'trip', role: 'driver', status: 'active' } as any
    ];
    component.completeAssignment(component.assignments[0]);
    tick();
    expect(component.assignments[0].status).toBe('completed');
  }));

  it('should navigate to view service', () => {
    component.viewService(5);
    expect(uiSpy.triggerHaptic).toHaveBeenCalledWith('light');
    expect(serviceSpy.url).toHaveBeenCalledWith('/home/5/service-detail');
  });

  it('should navigate to view ride', () => {
    component.viewRide(10);
    expect(uiSpy.triggerHaptic).toHaveBeenCalledWith('light');
    expect(serviceSpy.url).toHaveBeenCalledWith('/home/10/ride-detail');
  });

  it('should create service request modal', fakeAsync(() => {
    component.createServiceRequest('service');
    tick();
    expect(serviceSpy.openModal).toHaveBeenCalled();
  }));

  it('should search services and navigate', fakeAsync(() => {
    component.searchServices('ride');
    tick();
    expect(sessionStorage.getItem('searchType')).toBe('ride');
    expect(serviceSpy.url).toHaveBeenCalledWith('/home/search');
    sessionStorage.removeItem('searchType');
  }));

  it('should create publication', fakeAsync(() => {
    component.createPublication();
    tick();
    expect(serviceSpy.url).toHaveBeenCalledWith('/home/create');
  }));

  it('should return assignment icon', () => {
    expect(component.getAssignmentIcon({ type: 'service' } as any)).toBe('briefcase');
    expect(component.getAssignmentIcon({ type: 'trip', role: 'driver' } as any)).toBe('car');
    expect(component.getAssignmentIcon({ type: 'trip', role: 'passenger' } as any)).toBe('person');
  });

  it('should return assignment type label', () => {
    expect(component.getAssignmentTypeLabel({ type: 'service' } as any)).toBe('Servicio');
    expect(component.getAssignmentTypeLabel({ type: 'trip', role: 'driver' } as any)).toBe('Conductor');
    expect(component.getAssignmentTypeLabel({ type: 'trip', role: 'passenger' } as any)).toBe('Pasajero');
  });

  it('should return status label', () => {
    expect(component.getStatusLabel('pending')).toBe('Pendiente');
    expect(component.getStatusLabel('active')).toBe('En curso');
    expect(component.getStatusLabel('completed')).toBe('Completado');
  });

  it('should return status color', () => {
    expect(component.getStatusColor('pending')).toBe('warning');
    expect(component.getStatusColor('active')).toBe('success');
    expect(component.getStatusColor('completed')).toBe('medium');
  });

  it('should delete publication from list', fakeAsync(() => {
    serviceSpy.Alert.and.callFake(async (opts: any) => {
      const btn = opts.buttons?.find((b: any) => b.role === 'destructive');
      if (btn?.handler) await btn.handler();
      return { role: 'destructive' } as any;
    });
    component.publications = [{ id: '1', title: 'Test' } as any, { id: '2', title: 'Test 2' } as any];
    const item = component.publications[0];
    component.deletePublication(item);
    tick();
    expect(component.publications.length).toBe(1);
    expect(component.myPublicationsCount).toBe(1);
  }));

  it('should edit publication', fakeAsync(() => {
    component.editPublication({ id: 5 });
    tick();
    expect(serviceSpy.url).toHaveBeenCalledWith('/home/edit/5');
  }));
});
