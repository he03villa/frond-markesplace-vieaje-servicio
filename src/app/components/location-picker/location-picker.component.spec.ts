import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocationPickerComponent } from './location-picker.component';

describe('LocationPickerComponent', () => {
  let component: LocationPickerComponent;
  let fixture: ComponentFixture<LocationPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationPickerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set default mode to picker', () => {
    expect(component.mode).toBe('picker');
  });

  it('should set default coordinates', () => {
    expect(component.latitude).toBe(11.2408);
    expect(component.longitude).toBe(-74.1990);
  });

  it('should bind searchQuery via ngModel', () => {
    component.searchQuery = 'Santa Marta';
    fixture.detectChanges();
    expect(component.searchQuery).toBe('Santa Marta');
  });

  it('should emit locationSelected with correct payload', () => {
    spyOn(component.locationSelected, 'emit');
    const lat = 11.24;
    const lng = -74.19;
    const address = 'Test Address';
    component.manualAddress = address;
    const marker = jasmine.createSpyObj('marker', ['getLatLng']);
    (marker.getLatLng as jasmine.Spy).and.returnValue({ lat, lng });
    (component as any).marker = marker;
    component.onManualAddressChange();
    expect(component.locationSelected.emit).toHaveBeenCalledWith({ lat, lng, address });
  });

  it('should clear search results and query', () => {
    component.searchResults = [{ lat: '1', lon: '1', display_name: 'Test' }] as any;
    component.searchQuery = 'test';
    component.clearSearch();
    expect(component.searchQuery).toBe('');
    expect(component.searchResults).toEqual([]);
  });

  it('should call destroyMap on ngOnDestroy', () => {
    spyOn(component as any, 'destroyMap');
    component.ngOnDestroy();
    expect((component as any).destroyMap).toHaveBeenCalled();
  });

  it('should not search if mode is viewer', async () => {
    component.mode = 'viewer';
    const event = { target: { value: 'test' } };
    await component.onSearchInput(event);
    expect(component.searchResults).toEqual([]);
  });

  it('should not search if mode is route', async () => {
    component.mode = 'route';
    const event = { target: { value: 'test' } };
    await component.onSearchInput(event);
    expect(component.searchResults).toEqual([]);
  });

  it('should not search if query is less than 3 characters', async () => {
    component.mode = 'picker';
    const event = { target: { value: 'ab' } };
    await component.onSearchInput(event);
    expect(component.searchResults).toEqual([]);
  });

  it('should get current location in viewer mode and center map', () => {
    component.mode = 'viewer';
    component.destinationLat = 11.24;
    component.destinationLng = -74.19;
    const map = jasmine.createSpyObj('map', ['setView']);
    (component as any).map = map;
    component.getCurrentLocation();
    expect(map.setView).toHaveBeenCalledWith([11.24, -74.19], 15);
  });

  it('should update marker position via updatePosition', () => {
    const map = jasmine.createSpyObj('map', ['setView']);
    const marker = jasmine.createSpyObj('marker', ['setLatLng']);
    (component as any).map = map;
    (component as any).marker = marker;
    component.updatePosition(11.25, -74.20);
    expect(map.setView).toHaveBeenCalledWith([11.25, -74.20], 15);
    expect(marker.setLatLng).toHaveBeenCalledWith([11.25, -74.20]);
  });

  it('should update manualAddress on manual address input', () => {
    const event = { target: { value: 'Calle 123' } };
    component.onManualAddressInput(event);
    expect(component.manualAddress).toBe('Calle 123');
  });
});
