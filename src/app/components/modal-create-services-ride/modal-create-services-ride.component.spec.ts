import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import { ModalCreateServicesRideComponent } from './modal-create-services-ride.component';
import { ServiceService } from 'src/app/services/service.service';
import { ServiceRequestsService } from 'src/app/services/service-requests.service';
import { RidesService } from 'src/app/services/rides.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ModalCreateServicesRideComponent', () => {
  let component: ModalCreateServicesRideComponent;
  let fixture: ComponentFixture<ModalCreateServicesRideComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let serviceServiceSpy: jasmine.SpyObj<ServiceService>;
  let serviceRequestsSpy: jasmine.SpyObj<ServiceRequestsService>;
  let ridesServiceSpy: jasmine.SpyObj<RidesService>;

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    serviceServiceSpy = jasmine.createSpyObj('ServiceService', ['presentLoading', 'Alert', 'presentToast', 'formValidate', 'addLoading', 'removeLoading']);
    serviceRequestsSpy = jasmine.createSpyObj('ServiceRequestsService', ['saveRequest', 'saveDeliverRequest']);
    ridesServiceSpy = jasmine.createSpyObj('RidesService', ['saveRide']);

    const loadingMock = { present: jasmine.createSpy('present').and.returnValue(Promise.resolve()), dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve()) };
    serviceServiceSpy.presentLoading.and.returnValue(Promise.resolve(loadingMock as any));
    serviceServiceSpy.Alert.and.returnValue(Promise.resolve({ present: jasmine.createSpy('present') } as any));

    TestBed.configureTestingModule({
      imports: [
        ModalCreateServicesRideComponent,
        FormsModule,
        CommonModule,
      ],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: ServiceService, useValue: serviceServiceSpy },
        { provide: ServiceRequestsService, useValue: serviceRequestsSpy },
        { provide: RidesService, useValue: ridesServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalCreateServicesRideComponent);
    component = fixture.componentInstance;
    component.type = 'service';
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.publicationType).toBe('service');
    expect(component.serviceForm.title).toBe('');
    expect(component.serviceForm.description).toBe('');
    expect(component.serviceForm.category).toBe('');
    expect(component.serviceImages.length).toBe(0);
  });

  it('isServiceFormValid returns false when required fields are empty', () => {
    expect(component.isServiceFormValid()).toBeFalse();
  });

  it('isServiceFormValid returns true when all required fields are filled', () => {
    component.serviceForm.title = 'Service title';
    component.serviceForm.description = 'Service description';
    component.serviceForm.category = 'category';
    component.serviceForm.address = 'Address';
    component.serviceForm.latitude = 10.5;
    component.serviceForm.longitude = -66.5;
    expect(component.isServiceFormValid()).toBeTrue();
  });

  it('isServiceFormValid validates budget_max >= budget_min', () => {
    component.serviceForm.title = 'T';
    component.serviceForm.description = 'D';
    component.serviceForm.category = 'C';
    component.serviceForm.address = 'A';
    component.serviceForm.latitude = 1;
    component.serviceForm.longitude = 2;
    component.serviceForm.budget_min = 100;
    component.serviceForm.budget_max = 50;
    expect(component.isServiceFormValid()).toBeFalse();

    component.serviceForm.budget_max = 200;
    expect(component.isServiceFormValid()).toBeTrue();
  });

  it('isRideFormValid returns false when required fields are empty', () => {
    component.publicationType = 'ride';
    expect(component.isRideFormValid()).toBeFalse();
  });

  it('isRideFormValid returns true when all required fields are filled', () => {
    component.rideForm.origin_address = 'Origin';
    component.rideForm.origin_lat = 10.5;
    component.rideForm.origin_lng = -66.5;
    component.rideForm.destination_address = 'Dest';
    component.rideForm.destination_lat = 11.5;
    component.rideForm.destination_lng = -67.5;
    component.rideForm.departure_time = '2024-01-01T10:00:00';
    component.rideForm.available_seats = 3;
    component.rideForm.price_per_seat = 50;
    expect(component.isRideFormValid()).toBeTrue();
  });

  it('isFormValid delegates to isServiceFormValid for service type', () => {
    component.serviceForm.title = 'T';
    component.serviceForm.description = 'D';
    component.serviceForm.category = 'C';
    component.serviceForm.address = 'A';
    component.serviceForm.latitude = 1;
    component.serviceForm.longitude = 2;
    expect(component.isFormValid()).toBeTrue();
  });

  it('isFormValid delegates to isRideFormValid for ride type', () => {
    component.publicationType = 'ride';
    expect(component.isFormValid()).toBe(component.isRideFormValid());
  });

  it('removeServiceImage removes image at index', () => {
    component.serviceImages = [{ url: 'url1', file: new File([''], 'a.png') }];
    component.removeServiceImage(0);
    expect(component.serviceImages.length).toBe(0);
  });

  it('resetForm resets service form and images', () => {
    component.serviceForm.title = 'Test';
    component.serviceForm.budget_min = 100;
    component.serviceImages = [{ url: 'url', file: new File([''], 'a.png') }];
    component.resetForm();
    expect(component.serviceForm.title).toBe('');
    expect(component.serviceForm.budget_min).toBeNull();
    expect(component.serviceImages.length).toBe(0);
  });

  it('resetForm resets ride form when type is ride', () => {
    component.publicationType = 'ride';
    component.rideForm.origin_address = 'Origin';
    component.rideForm.available_seats = 3;
    component.resetForm();
    expect(component.rideForm.origin_address).toBe('');
    expect(component.rideForm.available_seats).toBeNull();
  });

  it('salir calls modalCtrl.dismiss', () => {
    component.salir();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith();
  });

  it('onLocationSelected updates serviceForm fields', () => {
    const loc = { lat: 10.5, lng: -66.5, address: 'Addr' };
    component.onLocationSelected(loc);
    expect(component.serviceForm.latitude).toBe(10.5);
    expect(component.serviceForm.longitude).toBe(-66.5);
    expect(component.serviceForm.address).toBe('Addr');
  });

  it('onServiceLocationSelected updates serviceForm fields', () => {
    const loc = { lat: 11.5, lng: -67.5, address: 'Addr2' };
    component.onServiceLocationSelected(loc);
    expect(component.serviceForm.latitude).toBe(11.5);
    expect(component.serviceForm.longitude).toBe(-67.5);
    expect(component.serviceForm.address).toBe('Addr2');
  });

  it('onOriginLocationSelected updates rideForm origin fields', () => {
    const loc = { lat: 10.1, lng: -66.1, address: 'Origin' };
    component.onOriginLocationSelected(loc);
    expect(component.rideForm.origin_lat).toBe(10.1);
    expect(component.rideForm.origin_lng).toBe(-66.1);
    expect(component.rideForm.origin_address).toBe('Origin');
  });

  it('onDestinationLocationSelected updates rideForm destination fields', () => {
    const loc = { lat: 11.2, lng: -67.2, address: 'Dest' };
    component.onDestinationLocationSelected(loc);
    expect(component.rideForm.destination_lat).toBe(11.2);
    expect(component.rideForm.destination_lng).toBe(-67.2);
    expect(component.rideForm.destination_address).toBe('Dest');
  });

  it('createPublication shows error when form is invalid', async () => {
    await component.createPublication();
    expect(serviceServiceSpy.Alert).toHaveBeenCalled();
    expect(serviceRequestsSpy.saveRequest).not.toHaveBeenCalled();
  });

  it('createPublication calls saveRequest for service type', async () => {
    component.serviceForm.title = 'T';
    component.serviceForm.description = 'D';
    component.serviceForm.category = 'C';
    component.serviceForm.address = 'A';
    component.serviceForm.latitude = 1;
    component.serviceForm.longitude = 2;
    serviceRequestsSpy.saveRequest.and.returnValue(Promise.resolve({ success: true }));

    await component.createPublication();
    expect(serviceRequestsSpy.saveRequest).toHaveBeenCalledWith(jasmine.any(FormData));
  });

  it('createPublication calls saveRide for ride type', async () => {
    component.publicationType = 'ride';
    component.rideForm.origin_address = 'Origin';
    component.rideForm.origin_lat = '10.5';
    component.rideForm.origin_lng = '-66.5';
    component.rideForm.destination_address = 'Dest';
    component.rideForm.destination_lat = '11.5';
    component.rideForm.destination_lng = '-67.5';
    component.rideForm.departure_time = '2024-01-01T10:00:00';
    component.rideForm.available_seats = '3';
    component.rideForm.price_per_seat = '50';
    ridesServiceSpy.saveRide.and.returnValue(Promise.resolve({ success: true }));

    await component.createPublication();
    expect(ridesServiceSpy.saveRide).toHaveBeenCalled();
  });

  it('onServiceImagesSelected adds files to serviceImages', (done) => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const files = [file];
    component.onServiceImagesSelected(files as any);
    setTimeout(() => {
      expect(component.serviceImages.length).toBe(1);
      done();
    }, 50);
  });

  it('reverseGeocode returns formatted string', async () => {
    const result = await component.reverseGeocode(10.5, -66.5);
    expect(result).toBe('10.500000, -66.500000');
  });
});
