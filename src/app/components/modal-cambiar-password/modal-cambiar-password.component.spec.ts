import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { ModalCambiarPasswordComponent } from './modal-cambiar-password.component';
import { AuthService } from 'src/app/services/auth.service';
import { ServiceService } from 'src/app/services/service.service';

describe('ModalCambiarPasswordComponent', () => {
  let component: ModalCambiarPasswordComponent;
  let fixture: ComponentFixture<ModalCambiarPasswordComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let serviceServiceSpy: jasmine.SpyObj<ServiceService>;

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['changePassword']);
    serviceServiceSpy = jasmine.createSpyObj('ServiceService', ['formValidate', 'presentToast', 'presentLoading', 'Alert', 'addLoading', 'removeLoading']);
    serviceServiceSpy.presentToast.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      imports: [ModalCambiarPasswordComponent, ReactiveFormsModule],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ServiceService, useValue: serviceServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalCambiarPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form on ngOnInit', () => {
    expect(component.passwordForm).toBeDefined();
    expect(component.passwordForm.contains('current')).toBeTrue();
    expect(component.passwordForm.contains('new')).toBeTrue();
    expect(component.passwordForm.contains('confirm')).toBeTrue();
  });

  it('form should be invalid when empty', () => {
    expect(component.passwordForm.valid).toBeFalse();
  });

  it('salir calls modalCtrl.dismiss with undefined', () => {
    component.salir();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(undefined);
  });

  it('salir calls modalCtrl.dismiss with data', () => {
    component.salir({ success: true });
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({ success: true });
  });

  it('canSubmitPassword returns false when form is invalid', () => {
    expect(component.canSubmitPassword).toBeFalse();
  });

  it('canSubmitPassword returns true when form is valid and not submitting', () => {
    component.passwordForm.patchValue({
      current: 'old',
      new: 'NewPass1!',
      confirm: 'NewPass1!'
    });
    expect(component.canSubmitPassword).toBeTrue();
  });

  it('submitPasswordChange calls formValidate on invalid form', async () => {
    await component.submitPasswordChange();
    expect(serviceServiceSpy.formValidate).toHaveBeenCalledWith(component.passwordForm);
    expect(authServiceSpy.changePassword).not.toHaveBeenCalled();
  });

  it('submitPasswordChange calls authService.changePassword on valid form', async () => {
    component.passwordForm.patchValue({
      current: 'old',
      new: 'NewPass1!',
      confirm: 'NewPass1!'
    });
    authServiceSpy.changePassword.and.returnValue(Promise.resolve({ success: true }));

    await component.submitPasswordChange();
    expect(authServiceSpy.changePassword).toHaveBeenCalledWith({
      current_password: 'old',
      new_password: 'NewPass1!',
      new_password_confirmation: 'NewPass1!'
    });
    expect(serviceServiceSpy.presentToast).toHaveBeenCalledWith('Contraseña actualizada correctamente', 'success');
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
    expect(component.isSubmittingPassword).toBeFalse();
  });

  it('submitPasswordChange sets isSubmittingPassword false on error', async () => {
    component.passwordForm.patchValue({
      current: 'old',
      new: 'NewPass1!',
      confirm: 'NewPass1!'
    });
    authServiceSpy.changePassword.and.returnValue(Promise.reject({ error: 'fail' }));

    await component.submitPasswordChange();
    expect(component.isSubmittingPassword).toBeFalse();
  });

  it('calculateStrength sets correct values for empty password', () => {
    component.calculateStrength('');
    expect(component.passwordStrength).toBe(0);
    expect(component.strengthClass).toBe('');
    expect(component.strengthLabel).toBe('Muy débil');
  });

  it('calculateStrength returns weak for short password', () => {
    component.calculateStrength('abc');
    expect(component.passwordStrength).toBeLessThan(30);
    expect(component.strengthClass).toBe('weak');
    expect(component.strengthLabel).toBe('Muy débil');
  });

  it('calculateStrength returns excellent for strong password', () => {
    component.calculateStrength('Str0ng!Pass#wordLong!');
    expect(component.passwordStrength).toBeGreaterThanOrEqual(90);
    expect(component.strengthClass).toBe('excellent');
  });

  it('passwordMatchValidator sets mismatch error when passwords differ', () => {
    component.passwordForm.patchValue({
      current: 'old',
      new: 'NewPass1!',
      confirm: 'Different1!'
    });
    expect(component.passwordForm.errors).toEqual({ mismatch: true });
    expect(component.passwordForm.get('confirm')?.errors).toEqual({ mismatch: true });
  });

  it('isCurrentInvalid returns true when current is invalid and touched', () => {
    component.passwordForm.get('current')?.markAsTouched();
    expect(component.isCurrentInvalid).toBeTrue();
  });

  it('getNewErrorMessage returns correct messages', () => {
    component.passwordForm.get('new')?.markAsTouched();
    expect(component.getNewErrorMessage()).toBe('Ingresa una nueva contraseña');

    component.passwordForm.patchValue({ new: 'short' });
    expect(component.getNewErrorMessage()).toBe('Mínimo 8 caracteres');

    component.passwordForm.patchValue({ new: 'abcdefgh' });
    expect(component.getNewErrorMessage()).toBe('Incluye números y símbolos (!@#$%^&*)');
  });

  it('getConfirmErrorMessage returns correct messages', () => {
    component.passwordForm.patchValue({ confirm: '' });
    component.passwordForm.get('confirm')?.markAsTouched();
    expect(component.getConfirmErrorMessage()).toBe('Confirma tu contraseña');

    component.passwordForm.patchValue({ new: 'NewPass1!', confirm: 'Different1!' });
    expect(component.getConfirmErrorMessage()).toBe('Las contraseñas no coinciden');
  });
});
