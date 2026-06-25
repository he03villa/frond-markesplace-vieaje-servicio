import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MyServicesPage } from './my-services.page';
import { ServiceService } from 'src/app/services/service.service';
import { ServiceRequestsService } from 'src/app/services/service-requests.service';
import { ActionSheetController } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';

describe('MyServicesPage', () => {
  let component: MyServicesPage;
  let fixture: ComponentFixture<MyServicesPage>;
  let serviceSpy: jasmine.SpyObj<ServiceService>;
  let serviceRequestsSpy: jasmine.SpyObj<ServiceRequestsService>;
  let actionSheetSpy: jasmine.SpyObj<ActionSheetController>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  const mockResponse = {
    success: true,
    data: {
      services: [{ id: 1, title: 'Test Service', status: 'active', status_label: 'Activo' }],
      stats: { active: 1, completed: 0, paused: 0, total_earnings: 100, total_views: 50, totalOffers: 3, total: 1 }
    }
  };

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ServiceService', ['url', 'Toast']);
    serviceRequestsSpy = jasmine.createSpyObj('ServiceRequestsService', ['getMyRequests']);
    actionSheetSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);

    serviceRequestsSpy.getMyRequests.and.resolveTo(mockResponse);
    actionSheetSpy.create.and.resolveTo({ present: () => Promise.resolve() } as any);

    await TestBed.configureTestingModule({
      imports: [MyServicesPage],
      providers: [
        { provide: ServiceService, useValue: serviceSpy },
        { provide: ServiceRequestsService, useValue: serviceRequestsSpy },
        { provide: ActionSheetController, useValue: actionSheetSpy },
        { provide: ModalController, useValue: modalCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyServicesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load services on init', fakeAsync(() => {
    component.loadServices();
    tick();
    expect(serviceRequestsSpy.getMyRequests).toHaveBeenCalledWith({ status: 'all', page: 1 });
    expect(component.services.length).toBe(1);
    expect(component.isLoading).toBe(false);
  }));

  it('should navigate back', () => {
    component.back();
    expect(serviceSpy.url).toHaveBeenCalledWith('/home/profile');
  });

  it('should set tab and apply filters', () => {
    spyOn(component, 'applyFilters');
    component.setTab('active');
    expect(component.activeTab).toBe('active');
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should open actions sheet', fakeAsync(() => {
    const service = { id: 1, title: 'Test' } as any;
    component.openActions(service);
    tick();
    expect(actionSheetSpy.create).toHaveBeenCalled();
  }));

  it('should navigate to edit service', () => {
    component.editService(5);
    expect(serviceSpy.url).toHaveBeenCalledWith('/home/5/edit-service');
  });

  it('should navigate to view service', () => {
    component.viewService(5);
    expect(serviceSpy.url).toHaveBeenCalledWith('/home/5/service-detail');
  });

  it('should toggle pause status', fakeAsync(() => {
    const service = { id: 1, status: 'active', status_label: 'Activo' } as any;
    component.togglePause(service);
    tick();
    expect(service.status).toBe('paused');
    expect(service.status_label).toBe('Pausado');
  }));

  it('should delete service from list', fakeAsync(() => {
    component.services = [{ id: 1, title: 'Test' } as any, { id: 2, title: 'Test 2' } as any];
    component.deleteService(component.services[0]);
    tick();
    expect(component.services.length).toBe(1);
  }));

  it('should update headerSolid on scroll', () => {
    component.onScroll({ detail: { scrollTop: 100 } });
    expect(component.headerSolid).toBe(true);
    component.onScroll({ detail: { scrollTop: 50 } });
    expect(component.headerSolid).toBe(false);
  });

  it('should return status color', () => {
    expect(component.getStatusColor('active')).toBe('#10b981');
    expect(component.getStatusColor('completed')).toBe('#6366f1');
    expect(component.getStatusColor('paused')).toBe('#f59e0b');
  });

  it('should return status icon', () => {
    expect(component.getStatusIcon('active')).toBe('checkmark-circle-outline');
    expect(component.getStatusIcon('paused')).toBe('pause-circle-outline');
  });

  it('should handle refresh', fakeAsync(() => {
    const ev = jasmine.createSpyObj('ev', ['target']);
    ev.target = jasmine.createSpyObj('target', ['complete']);
    component.handleRefresh(ev);
    tick();
    expect(ev.target.complete).toHaveBeenCalled();
  }));

  it('should clear search and apply filters', () => {
    spyOn(component, 'applyFilters');
    component.searchQuery = 'test';
    component.clearSearch();
    expect(component.searchQuery).toBe('');
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should create service', () => {
    component.createService();
    expect(serviceSpy.url).toHaveBeenCalledWith('/create-service');
  });
});
