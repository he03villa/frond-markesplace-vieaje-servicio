import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { ServiceService } from 'src/app/services/service.service';
import { AuthService } from 'src/app/services/auth.service';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let serviceSpy: jasmine.SpyObj<ServiceService>;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ServiceService', ['addLoading', 'removeLoading', 'formValidate', 'url']);
    authSpy = jasmine.createSpyObj('AuthService', ['login', 'saveSession']);

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        { provide: ServiceService, useValue: serviceSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form on init', () => {
    expect(component.form).toBeDefined();
  });

  it('should have email control with required and email validators', () => {
    const email = component.form.get('email');
    expect(email).toBeDefined();
    email?.setValue('');
    expect(email?.valid).toBeFalse();
    expect(email?.errors?.['required']).toBeTrue();
    email?.setValue('notanemail');
    expect(email?.errors?.['email']).toBeDefined();
    email?.setValue('test@example.com');
    expect(email?.valid).toBeTrue();
  });

  it('should have password control with required and minLength(8) validators', () => {
    const password = component.form.get('password');
    expect(password).toBeDefined();
    password?.setValue('');
    expect(password?.valid).toBeFalse();
    expect(password?.errors?.['required']).toBeTrue();
    password?.setValue('1234567');
    expect(password?.errors?.['minlength']).toBeDefined();
    password?.setValue('12345678');
    expect(password?.valid).toBeTrue();
  });

  it('should mark form as invalid when both fields are empty', () => {
    component.form.get('email')?.setValue('');
    component.form.get('password')?.setValue('');
    expect(component.form.valid).toBeFalse();
  });

  it('should mark form as valid when all fields are correctly filled', () => {
    component.form.get('email')?.setValue('test@example.com');
    component.form.get('password')?.setValue('12345678');
    expect(component.form.valid).toBeTrue();
  });

  it('should call login and navigate on valid form submission', async () => {
    authSpy.login.and.returnValue(Promise.resolve({
      success: true,
      data: { access_token: 'test-token', user: { id: 1, name: 'Test' } }
    }));

    component.form.get('email')?.setValue('test@example.com');
    component.form.get('password')?.setValue('12345678');

    const formEl = document.createElement('form');
    const event = { preventEnter: true, preventDefault: jasmine.createSpy(), target: formEl } as any;

    await component.login(event);

    expect(authSpy.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: '12345678'
    });
    expect(authSpy.saveSession).toHaveBeenCalledWith({
      access_token: 'test-token',
      user: { id: 1, name: 'Test' }
    });
    expect(serviceSpy.url).toHaveBeenCalledWith('/home');
  });

  it('should call formValidate on invalid form submission', async () => {
    component.form.get('email')?.setValue('');
    component.form.get('password')?.setValue('');

    const formEl = document.createElement('form');
    const event = { preventEnter: true, preventDefault: jasmine.createSpy(), target: formEl } as any;

    await component.login(event);

    expect(serviceSpy.formValidate).toHaveBeenCalled();
    expect(serviceSpy.url).not.toHaveBeenCalled();
  });

  it('should add loading indicator before login call', async () => {
    authSpy.login.and.returnValue(Promise.resolve({
      success: true,
      data: { access_token: 'token', user: {} }
    }));

    component.form.get('email')?.setValue('test@example.com');
    component.form.get('password')?.setValue('12345678');

    const formEl = document.createElement('form');
    const event = { preventEnter: true, preventDefault: jasmine.createSpy(), target: formEl } as any;

    await component.login(event);

    expect(serviceSpy.addLoading).toHaveBeenCalledWith(formEl);
    expect(serviceSpy.removeLoading).toHaveBeenCalledWith(formEl);
  });

  it('should handle login error gracefully', async () => {
    authSpy.login.and.returnValue(Promise.reject({ error: { message: 'Invalid credentials' } }));

    component.form.get('email')?.setValue('test@example.com');
    component.form.get('password')?.setValue('12345678');

    const formEl = document.createElement('form');
    const event = { preventEnter: true, preventDefault: jasmine.createSpy(), target: formEl } as any;

    await component.login(event);

    expect(serviceSpy.removeLoading).toHaveBeenCalledWith(formEl);
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalse();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTrue();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeFalse();
  });
});
