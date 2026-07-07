import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SearchPage } from './search.page';
import { ServiceService } from 'src/app/services/service.service';
import { PublicationsService } from 'src/app/services/publications.service';
import { LocationService } from 'src/app/services/location.service';
import { ModalController } from '@ionic/angular/standalone';

describe('SearchPage', () => {
  let component: SearchPage;
  let fixture: ComponentFixture<SearchPage>;
  let serviceSpy: jasmine.SpyObj<ServiceService>;
  let pubSpy: jasmine.SpyObj<PublicationsService>;
  let locationSpy: jasmine.SpyObj<LocationService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  const mockPubResponse = {
    success: true,
    data: {
      publications: [{ id: 1, title: 'Test', type: 'service', type_label: 'Servicio', user: { rating: 4.5, avatar: '' }, meta: { price: 100, budget_range: '100-200' } }],
      pagination: { has_more_pages: false, current_page: 1 }
    }
  };

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ServiceService', ['url', 'Toast']);
    pubSpy = jasmine.createSpyObj('PublicationsService', ['getMyPublicationsExplore']);
    locationSpy = jasmine.createSpyObj('LocationService', ['getCurrentPosition']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);

    pubSpy.getMyPublicationsExplore.and.resolveTo(mockPubResponse);
    locationSpy.getCurrentPosition.and.resolveTo({ lat: -34.6037, lng: -58.3816 });

    await TestBed.configureTestingModule({
      imports: [SearchPage],
      providers: [
        { provide: ServiceService, useValue: serviceSpy },
        { provide: PublicationsService, useValue: pubSpy },
        { provide: LocationService, useValue: locationSpy },
        { provide: ModalController, useValue: modalCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load publications', fakeAsync(() => {
    component.loadPublications();
    tick();
    expect(pubSpy.getMyPublicationsExplore).toHaveBeenCalled();
    expect(component.publications.length).toBe(1);
    expect(component.isLoading).toBe(false);
  }));

  it('should navigate back', () => {
    component.back();
    expect(serviceSpy.url).toHaveBeenCalledWith('/home');
  });

  it('should select category and reload', fakeAsync(() => {
    component.selectCategory('service');
    tick();
    expect(component.filters.category).toBe('service');
    expect(component.categories.find(c => c.id === 'service')?.active).toBe(true);
  }));

  it('should set view', () => {
    component.setView('list');
    expect(component.currentView).toBe('list');
    expect(component.isMapView).toBe(false);
  });

  it('should toggle map view', () => {
    component.toggleMapView();
    expect(component.isMapView).toBe(true);
    component.toggleMapView();
    expect(component.isMapView).toBe(false);
  });

  it('should open and close filter modal', () => {
    component.openFilterModal();
    expect(component.showFilterModal).toBe(true);
    component.closeFilterModal();
    expect(component.showFilterModal).toBe(false);
  });

  it('should apply filters', fakeAsync(() => {
    component.tempFilters = { ...component.filters, category: 'ride' };
    component.applyFilters();
    tick();
    expect(component.filters.category).toBe('ride');
    expect(component.showFilterModal).toBe(false);
  }));

  it('should clear all filters', () => {
    component.filters.category = 'service';
    component.filters.type = 'services';
    component.clearAllFilters();
    expect(component.tempFilters.category).toBeNull();
    expect(component.tempFilters.type).toBeNull();
  });

  it('should open publication detail for service', () => {
    spyOn(component, 'viewService');
    const pub = { id: 1, type: 'service' } as any;
    component.openPublicationDetail(pub);
    expect(component.viewService).toHaveBeenCalledWith(1);
  });

  it('should open publication detail for ride', () => {
    spyOn(component, 'viewRide');
    const pub = { id: 2, type: 'ride' } as any;
    component.openPublicationDetail(pub);
    expect(component.viewRide).toHaveBeenCalledWith(2);
  });

  it('should show header shadow on scroll', () => {
    component.onScroll({ detail: { scrollTop: 50 } });
    expect(component.showHeaderShadow).toBe(true);
    component.onScroll({ detail: { scrollTop: 10 } });
    expect(component.showHeaderShadow).toBe(false);
  });

  it('should handle search with debounce', fakeAsync(() => {
    spyOn(component, 'loadPublications');
    component.onSearchQueryChange('test');
    expect(component.searchQuery).toBe('test');
    tick(500);
    expect(component.loadPublications).toHaveBeenCalledWith(true);
  }));

  it('should clear search', fakeAsync(() => {
    spyOn(component, 'loadPublications');
    component.searchQuery = 'test';
    component.filters.search = 'test';
    component.onSearchQueryChange('');
    expect(component.searchQuery).toBe('');
    expect(component.filters.search).toBe('');
    tick(500);
    expect(component.loadPublications).toHaveBeenCalledWith(true);
  }));

  it('should remove filter category and select all', () => {
    spyOn(component, 'selectCategory');
    component.removeFilter('category');
    expect(component.selectCategory).toHaveBeenCalledWith('all');
  });

  it('should return rating color', () => {
    expect(component.getRatingColor(5)).toBe('#10b981');
    expect(component.getRatingColor(4.2)).toBe('#f59e0b');
    expect(component.getRatingColor(3.5)).toBe('#ef4444');
    expect(component.getRatingColor(2)).toBe('#6b7280');
  });

  it('should format price', () => {
    expect(component.formatPrice(50000)).toBe('50.000\u00a0COP');
  });

  it('should get relative time strings', () => {
    const now = new Date().toISOString();
    expect(component.getRelativeTime(now)).toBe('Ahora');

    const fiveMinAgo = new Date(Date.now() - 300000).toISOString();
    expect(component.getRelativeTime(fiveMinAgo)).toBe('Hace 5 min');
  });

  it('should return type label', () => {
    expect(component.getTypeLabel('services')).toBe('Servicios');
    expect(component.getTypeLabel('rides')).toBe('Viajes');
    expect(component.getTypeLabel(null)).toBe('');
  });
});
