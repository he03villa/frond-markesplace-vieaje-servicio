import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { StatisticsPage } from './statistics.page';
import { RidesService } from 'src/app/services/rides.service';
import { ServiceService } from 'src/app/services/service.service';
import { ModalController } from '@ionic/angular/standalone';

describe('StatisticsPage', () => {
  let component: StatisticsPage;
  let fixture: ComponentFixture<StatisticsPage>;
  let ridesSpy: jasmine.SpyObj<RidesService>;
  let serviceSpy: jasmine.SpyObj<ServiceService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  beforeEach(async () => {
    ridesSpy = jasmine.createSpyObj('RidesService', ['getStats']);
    serviceSpy = jasmine.createSpyObj('ServiceService', ['url']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);

    ridesSpy.getStats.and.resolveTo({
      success: true,
      data: {
        period: 'month',
        kpis: [{ label: 'Ganancias', value: '$1,240', change: '+12.5%', icon: 'cash-outline', color: '#10b981', bg: 'rgba(16,185,129,0.1)' }],
        weekly_chart: [],
        insights: [],
        heatmap: []
      }
    });

    await TestBed.configureTestingModule({
      imports: [StatisticsPage],
      providers: [
        { provide: RidesService, useValue: ridesSpy },
        { provide: ServiceService, useValue: serviceSpy },
        { provide: ModalController, useValue: modalCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StatisticsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load statistics on init', fakeAsync(() => {
    component.loadRidesStatistics();
    tick();
    expect(ridesSpy.getStats).toHaveBeenCalledWith({ period: 'month' });
    expect(component.isLoading).toBe(false);
  }));

  it('should navigate back', () => {
    component.back();
    expect(serviceSpy.url).toHaveBeenCalledWith('/home');
  });

  it('should set period and reload data', () => {
    spyOn(component, 'loadRidesStatistics');
    component.setPeriod('week');
    expect(component.activePeriod).toBe('week');
    expect(component.loadRidesStatistics).toHaveBeenCalledWith(true);
  });

  it('should update headerSolid on scroll', () => {
    component.onScroll({ detail: { scrollTop: 100 } });
    expect(component.headerSolid).toBe(true);
    component.onScroll({ detail: { scrollTop: 30 } });
    expect(component.headerSolid).toBe(false);
  });

  it('should return correct trend icon', () => {
    expect(component.getTrendIcon('up')).toBe('trending-up-outline');
    expect(component.getTrendIcon('down')).toBe('trending-down-outline');
    expect(component.getTrendIcon('neutral')).toBe('remove-outline');
  });

  it('should have default kpis array', () => {
    expect(component.kpis.length).toBeGreaterThan(0);
  });

  it('should handle refresh', fakeAsync(() => {
    spyOn(component, 'randomizeData');
    const ev = jasmine.createSpyObj('ev', ['target']);
    ev.target = jasmine.createSpyObj('target', ['complete']);
    component.handleRefresh(ev);
    tick(500);
    expect(ev.target.complete).toHaveBeenCalled();
  }));
});
