import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon } from '@ionic/angular/standalone';
import { ServiceService } from 'src/app/services/service.service';
import { addIcons } from 'ionicons';
import { alertCircle, arrowBack, arrowForward, checkmark, closeOutline, eye, eyeOff, key, logIn, mail, mailOutline, refresh, refreshOutline, shieldCheckmark, timeOutline, warning } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [FormsModule, IonIcon]
})
export class ForgotPasswordPage {

  private _service: ServiceService = inject(ServiceService);
  private _authService: AuthService = inject(AuthService);

  step: 'email' | 'otp' | 'password' | 'success' = 'email';
  email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';

  // Estados de UI
  isLoading = false;
  canResend = false;
  resendTimer = 60;
  timerInterval: any;

  // Validación
  passwordError = '';
  otpError = '';
  emailError = '';

  // Toggle visibilidad contraseña
  showPassword = false;
  showConfirm = false;

  activeOtpIndex = 0;

  constructor() { 
    addIcons({ 
      closeOutline, mailOutline, arrowForward, alertCircle, arrowBack, mail,
      timeOutline, refreshOutline, warning, shieldCheckmark, refresh, eye, eyeOff,
      key, checkmark, logIn
    });
  }

  // ==================== PASO 1: ENVIAR EMAIL ====================
  async sendResetCode() {
    if (!this.isValidEmail(this.email)) {
      this.emailError = 'Ingresa un correo válido';
      this.shakeInput('email-input');
      return;
    }

    const loading = await this._service.presentLoading({
      message: 'Enviando código...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const data = { email: this.email };
      const response = await this._authService.forgetPassword(data);
      if (response.success) {
        await loading.dismiss();
        this.showToast('Código enviado a tu correo', 'success');
        this.step = 'otp';
        this.startResendTimer();
      }
    } catch (error: any) {
      await loading.dismiss();
      this.emailError = error.error?.message || 'No se encontró una cuenta con este correo';
      this.shakeInput('email-input');
    }
  }

  // ==================== PASO 2: VERIFICAR OTP ====================
  async verifyOtp() {
    if (this.otp.length !== 6) {
      this.otpError = 'Ingresa el código de 6 dígitos';
      this.shakeInput('otp-input');
      return;
    }

    const loading = await this._service.presentLoading({
      message: 'Verificando...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const data = { email: this.email, code: this.otp };
      const response = await this._authService.verifyOtp(data);
      if (response.success) {
        await loading.dismiss();
        this.step = 'password';
      }
    } catch (error: any) {
      await loading.dismiss();
      this.otpError = error.error?.message || 'Código incorrecto o expirado';
      this.shakeInput('otp-input');
      this.otp = '';
    }
  }

  // ==================== PASO 3: RESETEAR CONTRASEÑA ====================
  async resetPassword() {
    // Validaciones
    if (this.newPassword.length < 8) {
      this.passwordError = 'Mínimo 8 caracteres';
      this.shakeInput('password-input');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Las contraseñas no coinciden';
      this.shakeInput('confirm-input');
      return;
    }

    const loading = await this._service.presentLoading({
      message: 'Actualizando contraseña...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const data = { email: this.email, code: this.otp, password: this.newPassword, password_confirmation: this.confirmPassword };
      const response = await this._authService.resetPassword(data);
      if (response.success) {
        await loading.dismiss();
        this.step = 'success';
      }
    } catch (error: any) {
      await loading.dismiss();
      this.passwordError = error.error?.message || 'Error al actualizar la contraseña';
    }
  }

  // ==================== UTILIDADES ====================
  onOtpInput(event: any, index: number) {
    const value = event.target.value.replace(/\D/g, '');
    event.target.value = value;

    this.otp = this.getOtpValue();
    this.activeOtpIndex = value ? Math.min(index + 1, 5) : index;

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    if (this.otp.length === 6) {
      setTimeout(() => this.verifyOtp(), 300);
    }
  }

  onOtpKeydown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  }
  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const paste = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6);

    if (paste) {
      paste.split('').forEach((digit, i) => {
        const input = document.getElementById(`otp-${i}`) as HTMLInputElement;
        if (input) input.value = digit;
      });
      this.otp = paste;
      if (paste.length === 6) setTimeout(() => this.verifyOtp(), 300);
    }
  }

  getOtpValue(): string {
    let value = '';
    for (let i = 0; i < 6; i++) {
      const input = document.getElementById(`otp-${i}`) as HTMLInputElement;
      value += input?.value || '';
    }
    return value;
  }

  startResendTimer() {
    this.canResend = false;
    this.resendTimer = 60;

    this.timerInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        this.canResend = true;
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  async resendCode() {
    if (!this.canResend) return;

    this.otp = '';
    this.otpError = '';
    // Limpiar inputs
    for (let i = 0; i < 6; i++) {
      const input = document.getElementById(`otp-${i}`) as HTMLInputElement;
      if (input) input.value = '';
    }
    document.getElementById('otp-0')?.focus();

    await this.sendResetCode();
  }

  togglePassword(field: 'password' | 'confirm') {
    if (field === 'password') this.showPassword = !this.showPassword;
    else this.showConfirm = !this.showConfirm;
  }

  // Validación de fuerza de contraseña
  get passwordStrength(): {
    score: number;
    label: string;
    color: string;
  } {
    const pwd = this.newPassword;
    if (!pwd) return { score: 0, label: '', color: '' };

    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const levels = [
      { score: 1, label: 'Débil', color: '#ef4444' },
      { score: 2, label: 'Regular', color: '#f59e0b' },
      { score: 3, label: 'Buena', color: '#3b82f6' },
      { score: 4, label: 'Fuerte', color: '#10b981' }
    ];

    return levels[score - 1] || levels[0];
  }

  // Helpers
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private async showToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this._service.Toast({
      message,
      duration: 3000,
      color,
      position: 'top',
      cssClass: 'custom-toast'
    });
  }

  private shakeInput(elementId: string) {
    const el = document.getElementById(elementId);
    el?.classList.add('shake');
    setTimeout(() => el?.classList.remove('shake'), 500);
  }

  goToLogin() {
    this._service.url('/login');
  }

}
