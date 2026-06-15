import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ModalController, IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, closeOutline, eyeOffOutline, eyeOutline, keyOutline, lockClosedOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-modal-cambiar-password',
  templateUrl: './modal-cambiar-password.component.html',
  styleUrls: ['./modal-cambiar-password.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, IonIcon, IonButton]
})
export class ModalCambiarPasswordComponent implements OnInit {

  private authService = inject(AuthService);
  private _service: ServiceService = inject(ServiceService);
  private modalCtr: ModalController = inject(ModalController);
  private fb: FormBuilder = inject(FormBuilder);

  passwordForm: FormGroup = new FormGroup({});
  isSubmittingPassword = false;
  passwordStrength = 0;
  strengthClass = '';
  strengthLabel = 'Muy débil';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor() {
    addIcons({
      closeOutline, shieldCheckmarkOutline, lockClosedOutline, eyeOffOutline, eyeOutline, keyOutline,
      checkmarkCircleOutline
    });
   }

  ngOnInit() {
    this.initPasswordForm();
   }

  salir(data: any = undefined) {
    this.modalCtr.dismiss(data);
  }

  private initPasswordForm() {
    this.passwordForm = this.fb.group({
      current: ['', [Validators.required]],
      new: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])/)
      ]],
      confirm: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
    this.passwordForm.get('new')?.valueChanges.subscribe(value => {
      this.calculateStrength(value);
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPass = control.get('new')?.value;
    const confirmPass = control.get('confirm')?.value;

    if (newPass && confirmPass && newPass !== confirmPass) {
      control.get('confirm')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  get currentControl() { return this.passwordForm.get('current'); }
  get newControl() { return this.passwordForm.get('new'); }
  get confirmControl() { return this.passwordForm.get('confirm'); }

  get isCurrentInvalid() {
    return this.currentControl?.invalid && (this.currentControl?.dirty || this.currentControl?.touched);
  }
  get isNewInvalid() {
    return this.newControl?.invalid && (this.newControl?.dirty || this.newControl?.touched);
  }
  get isConfirmInvalid() {
    return this.confirmControl?.invalid && (this.confirmControl?.dirty || this.confirmControl?.touched);
  }
  get isConfirmMismatch() {
    return this.confirmControl?.hasError('mismatch') && (this.confirmControl?.dirty || this.confirmControl?.touched);
  }

  get canSubmitPassword(): boolean {
    return this.passwordForm.valid && !this.isSubmittingPassword;
  }

  getNewErrorMessage(): string {
    if (this.newControl?.hasError('required')) return 'Ingresa una nueva contraseña';
    if (this.newControl?.hasError('minlength')) return 'Mínimo 8 caracteres';
    if (this.newControl?.hasError('pattern')) return 'Incluye números y símbolos (!@#$%^&*)';
    return '';
  }

  getConfirmErrorMessage(): string {
    if (this.confirmControl?.hasError('required')) return 'Confirma tu contraseña';
    if (this.isConfirmMismatch) return 'Las contraseñas no coinciden';
    return '';
  }

  calculateStrength(password: string) {
    if (!password) {
      this.passwordStrength = 0;
      this.strengthClass = '';
      this.strengthLabel = 'Muy débil';
      return;
    }

    let score = 0;
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    if (password.length >= 16) score += 15;

    this.passwordStrength = Math.min(score, 100);

    if (score < 30) {
      this.strengthClass = 'weak';
      this.strengthLabel = 'Muy débil';
    } else if (score < 50) {
      this.strengthClass = 'fair';
      this.strengthLabel = 'Débil';
    } else if (score < 70) {
      this.strengthClass = 'good';
      this.strengthLabel = 'Buena';
    } else if (score < 90) {
      this.strengthClass = 'strong';
      this.strengthLabel = 'Fuerte';
    } else {
      this.strengthClass = 'excellent';
      this.strengthLabel = 'Excelente';
    }
  }

  async submitPasswordChange() {
    if (this.passwordForm.invalid) {
      this._service.formValidate(this.passwordForm);
      return;
    }

    this.isSubmittingPassword = true;

    // Simulate API call
    const data = {
      current_password: this.passwordForm.value.current,
      new_password: this.passwordForm.value.new,
      new_password_confirmation : this.passwordForm.value.confirm
    };

    try {
      const response = await this.authService.changePassword(data);
      if (response.success) {
        this.isSubmittingPassword = false;
        this._service.presentToast('Contraseña actualizada correctamente', 'success');
        this.salir();
      }
    } catch (error) {
      this.isSubmittingPassword = false;
    }


    // Show success toast (integrate with your toast service)
    console.log('Password updated successfully', this.passwordForm.value);
  }

}
