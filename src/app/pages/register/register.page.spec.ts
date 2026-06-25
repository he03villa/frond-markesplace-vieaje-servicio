import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterPage } from './register.page';
import { ServiceService } from 'src/app/services/service.service';
import { AuthService } from 'src/app/services/auth.service';

describe('RegisterPage', () => {
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;
  let serviceSpy: jasmine.SpyObj<ServiceService>;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ServiceService', ['addLoading', 'removeLoading', 'formValidate', 'url', 'Alert']);
    authSpy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [
        { provide: ServiceService, useValue: serviceSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with all controls on init', () => {
    expect(component.form).toBeDefined();
    expect(component.form.contains('name')).toBeTrue();
    expect(component.form.contains('email')).toBeTrue();
    expect(component.form.contains('password')).toBeTrue();
    expect(component.form.contains('password_confirmation')).toBeTrue();
    expect(component.form.contains('terms')).toBeTrue();
  });

  it('should validate name field', () => {
    const name = component.form.get('name');
    name?.setValue('');
    expect(name?.valid).toBeFalse();
    expect(name?.errors?.['required']).toBeTrue();
    name?.setValue('ab');
    expect(name?.errors?.['minlength']).toBeDefined();
    name?.setValue('John Doe');
    expect(name?.valid).toBeTrue();
  });

  it('should validate email field', () => {
    const email = component.form.get('email');
    email?.setValue('invalid');
    expect(email?.valid).toBeFalse();
    email?.setValue('test@example.com');
    expect(email?.valid).toBeTrue();
  });

  it('should validate password with strength validator', () => {
    const password = component.form.get('password');
    password?.setValue('weak');
    expect(password?.valid).toBeFalse();
    password?.setValue('StrongPass1!');
    expect(password?.valid).toBeTrue();
  });

  it('should validate password_confirmation is required', () => {
    const confirm = component.form.get('password_confirmation');
    confirm?.setValue('');
    expect(confirm?.valid).toBeFalse();
    expect(confirm?.errors?.['required']).toBeTrue();
  });

  it('should validate terms must be true', () => {
    const terms = component.form.get('terms');
    terms?.setValue(false);
    expect(terms?.valid).toBeFalse();
    terms?.setValue(true);
    expect(terms?.valid).toBeTrue();
  });

  it('should detect password mismatch error', () => {
    component.form.get('password')?.setValue('StrongPass1!');
    component.form.get('password_confirmation')?.setValue('Different1!');
    component.form.get('password_confirmation')?.markAsTouched();
    component.form.updateValueAndValidity();
    expect(component.showPasswordMismatchError).toBeTrue();
  });

  it('should not show mismatch error when confirm password is empty', () => {
    component.form.get('password')?.setValue('StrongPass1!');
    component.form.get('password_confirmation')?.setValue('');
    component.form.updateValueAndValidity();
    expect(component.showPasswordMismatchError).toBeFalse();
  });

  it('should update password strength on password change', () => {
    const password = component.form.get('password');
    expect(component.passwordStrength).toBe('');
    password?.setValue('Abcdef1!');
    expect(component.passwordStrength).not.toBe('');
    expect(['weak', 'fair', 'good', 'strong']).toContain(component.passwordStrength);
  });

  it('should compute password requirements correctly', () => {
    component.form.get('password')?.setValue('Abcdef1!');
    const req = component.passwordRequirements;
    expect(req.length).toBeTrue();
    expect(req.uppercase).toBeTrue();
    expect(req.number).toBeTrue();
    expect(req.special).toBeTrue();

    component.form.get('password')?.setValue('short');
    const req2 = component.passwordRequirements;
    expect(req2.length).toBeFalse();
  });

  it('should call register and show alert on valid form', async () => {
    authSpy.register.and.returnValue(Promise.resolve({ success: true }));

    component.form.get('name')?.setValue('Test User');
    component.form.get('email')?.setValue('test@example.com');
    component.form.get('password')?.setValue('StrongPass1!');
    component.form.get('password_confirmation')?.setValue('StrongPass1!');
    component.form.get('terms')?.setValue(true);

    const formEl = document.createElement('form');
    const event = { preventEnter: true, preventDefault: jasmine.createSpy(), target: formEl } as any;

    await component.saveUser(event);

    expect(authSpy.register).toHaveBeenCalled();
    expect(serviceSpy.Alert).toHaveBeenCalledWith({
      message: 'El usuario se ha registrado correctamente',
      buttons: ['Aceptar']
    });
    expect(serviceSpy.url).toHaveBeenCalledWith('/login');
  });

  it('should call formValidate on invalid form', async () => {
    const formEl = document.createElement('form');
    const event = { preventEnter: true, preventDefault: jasmine.createSpy(), target: formEl } as any;

    await component.saveUser(event);

    expect(serviceSpy.formValidate).toHaveBeenCalled();
    expect(authSpy.register).not.toHaveBeenCalled();
  });

  it('should add loading before register call', async () => {
    authSpy.register.and.returnValue(Promise.resolve({ success: true }));

    component.form.get('name')?.setValue('Test User');
    component.form.get('email')?.setValue('test@example.com');
    component.form.get('password')?.setValue('StrongPass1!');
    component.form.get('password_confirmation')?.setValue('StrongPass1!');
    component.form.get('terms')?.setValue(true);

    const formEl = document.createElement('form');
    const event = { preventEnter: true, preventDefault: jasmine.createSpy(), target: formEl } as any;

    await component.saveUser(event);

    expect(serviceSpy.addLoading).toHaveBeenCalledWith(formEl);
    expect(serviceSpy.removeLoading).toHaveBeenCalledWith(formEl);
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalse();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTrue();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeFalse();
  });

  it('should toggle confirm password visibility', () => {
    expect(component.showConfirmPassword).toBeFalse();
    component.toggleConfirmPasswordVisibility();
    expect(component.showConfirmPassword).toBeTrue();
    component.toggleConfirmPasswordVisibility();
    expect(component.showConfirmPassword).toBeFalse();
  });

  it('should return strength label for each level', () => {
    component.passwordStrength = 'weak';
    expect(component.getStrengthLabel()).toContain('Débil');
    component.passwordStrength = 'fair';
    expect(component.getStrengthLabel()).toContain('Regular');
    component.passwordStrength = 'good';
    expect(component.getStrengthLabel()).toContain('Buena');
    component.passwordStrength = 'strong';
    expect(component.getStrengthLabel()).toContain('Fuerte');
    component.passwordStrength = '';
    expect(component.getStrengthLabel()).toContain('Seguridad de la contraseña');
  });

  it('should return strength percent', () => {
    component.form.get('password')?.setValue('');
    expect(component.getStrengthPercent()).toBe(0);
    component.form.get('password')?.setValue('Abcdef1!');
    expect(component.getStrengthPercent()).toBe(100);
  });
});
