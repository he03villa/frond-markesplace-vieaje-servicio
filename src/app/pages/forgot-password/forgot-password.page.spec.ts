import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ForgotPasswordPage } from './forgot-password.page';
import { ServiceService } from 'src/app/services/service.service';
import { AuthService } from 'src/app/services/auth.service';

describe('ForgotPasswordPage', () => {
  let component: ForgotPasswordPage;
  let fixture: ComponentFixture<ForgotPasswordPage>;
  let serviceSpy: jasmine.SpyObj<ServiceService>;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ServiceService', ['presentLoading', 'Toast', 'url']);
    authSpy = jasmine.createSpyObj('AuthService', ['forgetPassword', 'verifyOtp', 'resetPassword']);
    const loadingSpy = jasmine.createSpyObj('loading', ['present', 'dismiss']);
    serviceSpy.presentLoading.and.returnValue(Promise.resolve(loadingSpy));

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordPage],
      providers: [
        { provide: ServiceService, useValue: serviceSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with email step', () => {
    expect(component.step).toBe('email');
  });

  it('should initialize with empty fields', () => {
    expect(component.email).toBe('');
    expect(component.otp).toBe('');
    expect(component.newPassword).toBe('');
    expect(component.confirmPassword).toBe('');
  });

  it('should initialize with loading and error states as false/empty', () => {
    expect(component.isLoading).toBeFalse();
    expect(component.canResend).toBeFalse();
    expect(component.passwordError).toBe('');
    expect(component.otpError).toBe('');
    expect(component.emailError).toBe('');
  });

  describe('sendResetCode', () => {
    it('should reject invalid email', async () => {
      component.email = 'invalid';
      await component.sendResetCode();
      expect(component.emailError).toBe('Ingresa un correo válido');
      expect(authSpy.forgetPassword).not.toHaveBeenCalled();
    });

    it('should call forgetPassword on valid email and advance to otp step', async () => {
      authSpy.forgetPassword.and.returnValue(Promise.resolve({ success: true }));
      serviceSpy.Toast.and.returnValue(Promise.resolve());
      component.email = 'test@example.com';

      await component.sendResetCode();

      expect(authSpy.forgetPassword).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(component.step).toBe('otp');
      expect(serviceSpy.Toast).toHaveBeenCalled();
    });
  });

  describe('resend timer', () => {
    it('should start resend timer and countdown', fakeAsync(() => {
      component.startResendTimer();
      expect(component.canResend).toBeFalse();
      expect(component.resendTimer).toBe(60);

      tick(30000);
      expect(component.resendTimer).toBe(30);
      expect(component.canResend).toBeFalse();

      tick(30000);
      expect(component.resendTimer).toBe(0);
      expect(component.canResend).toBeTrue();
    }));

    it('should not resend if timer not finished', async () => {
      component.canResend = false;
      await component.resendCode();
      expect(authSpy.forgetPassword).not.toHaveBeenCalled();
    });
  });

  describe('verifyOtp', () => {
    it('should reject OTP shorter than 6 digits', async () => {
      component.otp = '12345';
      await component.verifyOtp();
      expect(component.otpError).toBe('Ingresa el código de 6 dígitos');
      expect(authSpy.verifyOtp).not.toHaveBeenCalled();
    });

    it('should call verifyOtp with valid OTP and advance to password step', async () => {
      authSpy.verifyOtp.and.returnValue(Promise.resolve({ success: true }));
      component.email = 'test@example.com';
      component.otp = '123456';

      await component.verifyOtp();

      expect(authSpy.verifyOtp).toHaveBeenCalledWith({ email: 'test@example.com', code: '123456' });
      expect(component.step).toBe('password');
    });
  });

  describe('resetPassword', () => {
    it('should reject password shorter than 8 characters', async () => {
      component.newPassword = 'short';
      await component.resetPassword();
      expect(component.passwordError).toBe('Mínimo 8 caracteres');
      expect(authSpy.resetPassword).not.toHaveBeenCalled();
    });

    it('should reject passwords that do not match', async () => {
      component.newPassword = '12345678';
      component.confirmPassword = 'different';
      await component.resetPassword();
      expect(component.passwordError).toBe('Las contraseñas no coinciden');
      expect(authSpy.resetPassword).not.toHaveBeenCalled();
    });

    it('should call resetPassword with valid inputs and advance to success step', async () => {
      authSpy.resetPassword.and.returnValue(Promise.resolve({ success: true }));
      component.email = 'test@example.com';
      component.otp = '123456';
      component.newPassword = 'NewPass1!';
      component.confirmPassword = 'NewPass1!';

      await component.resetPassword();

      expect(authSpy.resetPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        code: '123456',
        password: 'NewPass1!',
        password_confirmation: 'NewPass1!'
      });
      expect(component.step).toBe('success');
    });
  });

  describe('navigation helpers', () => {
    it('should navigate to login', () => {
      component.goToLogin();
      expect(serviceSpy.url).toHaveBeenCalledWith('/login');
    });
  });

  describe('password visibility toggles', () => {
    it('should toggle showPassword', () => {
      expect(component.showPassword).toBeFalse();
      component.togglePassword('password');
      expect(component.showPassword).toBeTrue();
      component.togglePassword('password');
      expect(component.showPassword).toBeFalse();
    });

    it('should toggle showConfirm', () => {
      expect(component.showConfirm).toBeFalse();
      component.togglePassword('confirm');
      expect(component.showConfirm).toBeTrue();
      component.togglePassword('confirm');
      expect(component.showConfirm).toBeFalse();
    });
  });

  describe('password strength', () => {
    it('should return score 0 when password is empty', () => {
      component.newPassword = '';
      const strength = component.passwordStrength;
      expect(strength.score).toBe(0);
      expect(strength.label).toBe('');
      expect(strength.color).toBe('');
    });

    it('should compute strength correctly', () => {
      component.newPassword = 'Abcdef1!';
      const strength = component.passwordStrength;
      expect(strength.score).toBe(4);
      expect(strength.label).toBe('Fuerte');
      expect(strength.color).toBeTruthy();
    });

    it('should return weak for simple passwords', () => {
      component.newPassword = '12345678';
      const strength = component.passwordStrength;
      expect(strength.label).toBe('Regular');
    });
  });

  describe('OTP input helpers', () => {
    it('should get OTP value from input elements', () => {
      for (let i = 0; i < 6; i++) {
        const input = document.createElement('input');
        input.id = `otp-${i}`;
        input.value = String(i);
        document.body.appendChild(input);
      }
      expect(component.getOtpValue()).toBe('012345');
      for (let i = 0; i < 6; i++) {
        document.body.removeChild(document.getElementById(`otp-${i}`)!);
      }
    });

    it('should handle OTP paste', () => {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', '987654');
      const event = new ClipboardEvent('paste', { clipboardData } as any);
      spyOn(event, 'preventDefault');
      component.onOtpPaste(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.otp).toBe('987654');
    });

    it('should handle OTP paste with non-digit characters', () => {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', '12-34-56');
      const event = new ClipboardEvent('paste', { clipboardData } as any);
      component.onOtpPaste(event);
      expect(component.otp).toBe('123456');
    });

    it('should handle OTP paste with more than 6 digits', () => {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', '123456789');
      const event = new ClipboardEvent('paste', { clipboardData } as any);
      component.onOtpPaste(event);
      expect(component.otp).toBe('123456');
    });
  });
});
