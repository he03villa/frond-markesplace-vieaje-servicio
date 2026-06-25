import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PublicarPage } from './publicar.page';
import { AlertController, NavController } from '@ionic/angular';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('PublicarPage', () => {
  let component: PublicarPage;
  let fixture: ComponentFixture<PublicarPage>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let alertCtrlSpy: jasmine.SpyObj<AlertController>;

  beforeEach(async () => {
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateBack']);
    alertCtrlSpy = jasmine.createSpyObj('AlertController', ['create']);
    alertCtrlSpy.create.and.resolveTo({ present: () => Promise.resolve() } as any);

    await TestBed.configureTestingModule({
      imports: [PublicarPage, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: NavController, useValue: navCtrlSpy },
        { provide: AlertController, useValue: alertCtrlSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PublicarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize forms on creation', () => {
    expect(component.servicioForm).toBeDefined();
    expect(component.viajeForm).toBeDefined();
    expect(component.tipoPublicacion).toBe('servicio');
  });

  it('should have required validators on service form fields', () => {
    const tituloCtrl = component.servicioForm.get('titulo');
    expect(tituloCtrl?.hasError('required')).toBe(true);
    tituloCtrl?.setValue('ab');
    expect(tituloCtrl?.hasError('minlength')).toBe(true);
    tituloCtrl?.setValue('12345');
    expect(tituloCtrl?.valid).toBe(true);
  });

  it('should have required validators on ride form fields', () => {
    const origenCtrl = component.viajeForm.get('origen');
    expect(origenCtrl?.hasError('required')).toBe(true);
    origenCtrl?.setValue('ab');
    expect(origenCtrl?.hasError('minlength')).toBe(true);
    origenCtrl?.setValue('Buenos Aires');
    expect(origenCtrl?.valid).toBe(true);
  });

  it('should change tipoPublicacion on tipoPublicacionChange', () => {
    const event = { detail: { value: 'viaje' } };
    component.tipoPublicacionChange(event);
    expect(component.tipoPublicacion).toBe('viaje');
  });

  it('should navigate back on cancelar', () => {
    component.cancelar();
    expect(navCtrlSpy.navigateBack).toHaveBeenCalledWith('/home');
  });

  it('should not submit invalid service form', fakeAsync(() => {
    component.tipoPublicacion = 'servicio';
    component.publicarServicio();
    tick();
    expect(component.servicioForm.touched).toBe(true);
    expect(component.isSubmitting).toBe(false);
  }));

  it('should submit valid service form successfully', fakeAsync(() => {
    component.servicioForm.setValue({
      titulo: 'Test Service Title',
      descripcion: 'This is a test service description',
      categoria: 'hogar',
      medidas: '10x10',
      presupuesto: 50000,
      ubicacion: 'Bogota',
      fechaLimite: new Date().toISOString()
    });
    component.publicarServicio();
    tick(2000);
    expect(navCtrlSpy.navigateBack).toHaveBeenCalledWith('/home');
    expect(component.isSubmitting).toBe(false);
  }));

  it('should not submit invalid ride form', fakeAsync(() => {
    component.tipoPublicacion = 'viaje';
    component.publicarViaje();
    tick();
    expect(component.viajeForm.touched).toBe(true);
    expect(component.isSubmitting).toBe(false);
  }));

  it('should submit valid ride form successfully', fakeAsync(() => {
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 2);
    component.viajeForm.setValue({
      origen: 'Bogota',
      destino: 'Medellin',
      fechaHora: futureDate.toISOString(),
      asientos: 3,
      costo: 50000,
      descripcion: 'Viaje comodo'
    });
    component.publicarViaje();
    tick(2000);
    expect(navCtrlSpy.navigateBack).toHaveBeenCalledWith('/home');
    expect(component.isSubmitting).toBe(false);
  }));

  it('should return error messages for controls', () => {
    const control = { errors: { required: true } };
    expect(component.getErrorMessages(control)).toBe('Este campo es requerido');

    const minLengthCtrl = { errors: { minlength: { requiredLength: 5 } } };
    expect(component.getErrorMessages(minLengthCtrl)).toBe('Mínimo 5 caracteres');

    const minCtrl = { errors: { min: { min: 1000 } } };
    expect(component.getErrorMessages(minCtrl)).toBe('El valor mínimo es 1000');

    const maxCtrl = { errors: { max: { max: 6 } } };
    expect(component.getErrorMessages(maxCtrl)).toBe('El valor máximo es 6');

    expect(component.getErrorMessages({})).toBe('');
  });
});
