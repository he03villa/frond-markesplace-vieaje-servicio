import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceService } from 'src/app/services/service.service';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorComponent } from 'src/app/components/error/error.component';
import { PasswordValidators } from 'src/app/validators/password-validators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, ErrorComponent, CommonModule]
})
export class RegisterPage implements OnInit {

  _service: ServiceService = inject(ServiceService);
  private fb: FormBuilder = inject(FormBuilder);
  private _authService: AuthService = inject(AuthService);

  form : FormGroup = new FormGroup({});
  passwordStrength: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading = false;

  constructor() { }

  ngOnInit() {
    this.iniciarForm();
  }

  iniciarForm() {
    this.form = this.fb.group({
      name: [null, Validators.compose([Validators.required, Validators.minLength(3)])],
      email: [null, Validators.compose([Validators.required, Validators.email])],
      password: [null, Validators.compose([Validators.required, PasswordValidators.strong()])],
      password_confirmation: [null, Validators.compose([Validators.required])],
      terms: [false, Validators.requiredTrue]
    }, { validators: PasswordValidators.matchPasswords('password', 'password_confirmation') });

    this.form.get('password')?.valueChanges.subscribe(value => {
      this.updatePasswordStrength(value);

      this.form.get('password_confirmation')?.updateValueAndValidity({ emitEvent: false });
    });

    this.form.get('password_confirmation')?.valueChanges.subscribe(() => {
      this.form.updateValueAndValidity({ emitEvent: false });
    });
  }

  get passwordRequirements() {
    const password = this.form.get('password')?.value || '';
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  }

  updatePasswordStrength(password: string) {
    if (!password) {
      this.passwordStrength = '';
      return;
    }

    const requirements = this.passwordRequirements;
    let strength = 0;
    
    if (requirements.length) strength++;
    if (requirements.uppercase) strength++;
    if (requirements.number) strength++;
    if (requirements.special) strength++;

    const strengthLevels = ['weak', 'fair', 'good', 'strong'];
    const levelIndex = Math.max(0, strength - 1);
    this.passwordStrength = strengthLevels[levelIndex];
  }

  get showPasswordMismatchError(): boolean {
    const confirmPassword = this.form.get('password_confirmation');
    const hasError = this.form.hasError('passwordMismatch');
    const isTouched = confirmPassword?.touched;
    const isDirty = confirmPassword?.dirty;
    
    return hasError && (isTouched || isDirty) as boolean;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getStrengthLabel(): string {
    const labels: { [key: string]: string } = {
      'weak': 'Débil',
      'fair': 'Regular',
      'good': 'Buena',
      'strong': 'Fuerte'
    };
    return this.passwordStrength ? `Seguridad: ${labels[this.passwordStrength]}` : 'Seguridad de la contraseña';
  }

  getStrengthPercent(): number {
    const score = Object.values(this.passwordRequirements).filter(Boolean).length;
    return (score / 4) * 100;
  }

  async saveUser(event: Event) {
    event.preventDefault();
    const target = event.target as HTMLFormElement;
    this._service.addLoading(target);
    this.isLoading = true;
    if (this.form.valid) {
      const data = this.form.value;
      try {
        const response = await this._authService.register(data);
        if (response.success) {
          const dataAler = {
            message: 'El usuario se ha registrado correctamente',
            buttons: ['Aceptar']
          };
          await this._service.Alert(dataAler);
          this._service.url('/login');
        }
      } catch (error) {
        console.error(error);
      }
      this._service.removeLoading(target);
      this.isLoading = false;
    } else {
      this._service.formValidate(this.form);
      this._service.removeLoading(target);
      this.isLoading = false;
    }
  }

}
