import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ServiceDetailPage } from './service-detail.page';
import { ServiceService } from 'src/app/services/service.service';
import { ServiceRequestsService } from 'src/app/services/service-requests.service';
import { AuthService } from 'src/app/services/auth.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { OffersService } from 'src/app/services/offers.service';
import { UiEffectsService } from 'src/app/services/ui-effects.service';
import { ModalController, AnimationController } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

describe('ServiceDetailPage', () => {
  let component: ServiceDetailPage;
  let fixture: ComponentFixture<ServiceDetailPage>;
  let serviceSpy: jasmine.SpyObj<ServiceService>;
  let serviceReqSpy: jasmine.SpyObj<ServiceRequestsService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let wsSpy: jasmine.SpyObj<WebsocketService>;
  let offerSpy: jasmine.SpyObj<OffersService>;
  let uiSpy: jasmine.SpyObj<UiEffectsService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  const mockService = {
    id: 1,
    title: 'Test Service',
    description: 'A longer description for testing purposes that exceeds the short threshold.',
    user_id: 2,
    user: { id: 2, name: 'John', avatar_url: '' },
    offers: [{ id: 1, price: 100, user: { id: 3, name: 'Offerer', rating: 4.5 }, user_id: 3, status: 'pending' }],
    offers_count: 1,
    status: 'pending'
  };

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ServiceService', ['url', 'presentLoading', 'openModal', 'Alert']);
    serviceReqSpy = jasmine.createSpyObj('ServiceRequestsService', ['getRequest']);
    authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    wsSpy = jasmine.createSpyObj('WebsocketService', ['isConnected', 'connect', 'leaveChannel', 'listenToService', 'listenToUserNotifications']);
    offerSpy = jasmine.createSpyObj('OffersService', ['saveAcceptOffer']);
    uiSpy = jasmine.createSpyObj('UiEffectsService', ['triggerHaptic', 'animateEntrance']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);

    authSpy.getCurrentUser.and.returnValue({ id: 1, name: 'Me' });
    serviceReqSpy.getRequest.and.resolveTo({ success: true, data: mockService });
    offerSpy.saveAcceptOffer.and.resolveTo({ success: true });
    serviceSpy.presentLoading.and.resolveTo({ present: () => Promise.resolve(), dismiss: () => Promise.resolve(true) } as any);
    wsSpy.isConnected.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [ServiceDetailPage],
      providers: [
        { provide: ServiceService, useValue: serviceSpy },
        { provide: ServiceRequestsService, useValue: serviceReqSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: WebsocketService, useValue: wsSpy },
        { provide: OffersService, useValue: offerSpy },
        { provide: UiEffectsService, useValue: uiSpy },
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
        CurrencyPipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set serviceId from route on creation', () => {
    expect(component.serviceId).toBe(1);
  });

  it('should load service on init', fakeAsync(() => {
    component.loadServiceDetail();
    tick();
    expect(serviceReqSpy.getRequest).toHaveBeenCalledWith(1);
    expect(component.service.title).toBe('Test Service');
  }));

  it('should connect to WebSocket on init', () => {
    component.connectToRealtimeUpdates(1);
    expect(wsSpy.connect).toHaveBeenCalled();
    expect(wsSpy.listenToService).toHaveBeenCalledWith(1, jasmine.any(Function));
  });

  it('should navigate back', () => {
    component.goBack();
    expect(uiSpy.triggerHaptic).toHaveBeenCalledWith('light');
    expect(serviceSpy.url).toHaveBeenCalledWith('/home');
  });

  it('should toggle favorite', () => {
    component.isFavorite = false;
    component.toggleFavorite();
    expect(component.isFavorite).toBe(true);
    expect(uiSpy.triggerHaptic).toHaveBeenCalledWith('medium');

    component.toggleFavorite();
    expect(component.isFavorite).toBe(false);
    expect(uiSpy.triggerHaptic).toHaveBeenCalledWith('light');
  });

  it('should share service', fakeAsync(() => {
    component.service = { title: 'Test', description: 'Desc' };
    component.shareService();
    tick(2100);
    expect(component.showShareTooltip).toBe(false);
  }));

  it('should selectImage and trigger haptic', () => {
    component.selectImage(2);
    expect(uiSpy.triggerHaptic).toHaveBeenCalledWith('light');
    expect(component.selectedImage).toBe(2);
  });

  it('should set rating', () => {
    component.rateWorker(4);
    expect(component.rating).toBe(4);
    expect(uiSpy.triggerHaptic).toHaveBeenCalledWith('light');
  });

  it('should update isScrolled on scroll', () => {
    component.onScroll({ detail: { scrollTop: 150 } });
    expect(component.isScrolled).toBe(true);
    component.onScroll({ detail: { scrollTop: 50 } });
    expect(component.isScrolled).toBe(false);
  });

  it('should sort offers by price', () => {
    component.service = {
      offers: [
        { price: 200, user: { rating: 4 } },
        { price: 100, user: { rating: 5 } }
      ]
    };
    component.offerSort = 'price';
    const sorted = component.sortedOffers;
    expect(sorted[0].price).toBe(100);
    expect(sorted[1].price).toBe(200);
  });

  it('should sort offers by rating', () => {
    component.service = {
      offers: [
        { price: 100, user: { rating: 4 } },
        { price: 200, user: { rating: 5 } }
      ]
    };
    component.offerSort = 'rating';
    const sorted = component.sortedOffers;
    expect(sorted[0].user.rating).toBe(5);
    expect(sorted[1].user.rating).toBe(4);
  });

  it('should sort offers by criteria', () => {
    component.sortOffers('rating');
    expect(component.offerSort).toBe('rating');
    expect(uiSpy.triggerHaptic).toHaveBeenCalledWith('light');
  });

  it('should call makeOffer modal', () => {
    component.makeOffer();
    expect(serviceSpy.openModal).toHaveBeenCalled();
  });

  it('should handle new offer and avoid duplicates', () => {
    component.service = { id: 1, offers: [], offers_count: 0, user_id: 1 };
    component.currentUser = { id: 1 };
    const data = { offer: { id: 10, price: 150, user: { id: 5, name: 'New' } } };
    component.handleNewOffer(data);
    expect(component.service.offers.length).toBe(1);
    expect(component.service.offers_count).toBe(1);

    component.handleNewOffer(data);
    expect(component.service.offers.length).toBe(1);
  });

  it('should handle offer accepted', () => {
    component.service = {
      offers: [{ id: 1, price: 100, status: 'pending', user: { id: 3 } }],
      status: 'pending',
      user_id: 1
    };
    component.currentUser = { id: 1 };
    const data = { offer: { id: 1, price: 100, status: 'accepted', user: { id: 3 } }, rejected_offers: [] };
    component.handleOfferAccepted(data);
    expect(component.service.status).toBe('in_progress');
  });

  it('should handle offer rejected', () => {
    component.service = {
      offers: [{ id: 1, price: 100, status: 'pending', user: { id: 3 } }]
    };
    component.currentUser = { id: 3 };
    const data = { offer: { id: 1, user: { id: 3 } } };
    component.handleOfferRejected(data);
    expect(component.service.offers[0].status).toBe('rejected');
  });

  it('should format price', () => {
    expect(component.formatPrice(1000)).toContain('1,000');
  });

  it('should get category icon', () => {
    expect(component.getCategoryIcon('tecnología')).toBe('laptop');
    expect(component.getCategoryIcon('hogar')).toBe('home');
    expect(component.getCategoryIcon('unknown')).toBe('briefcase');
  });
});
