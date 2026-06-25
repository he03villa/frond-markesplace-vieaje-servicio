import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalController, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircle, briefcaseOutline, chatbubblesOutline, checkmark, checkmarkCircle, closeCircle, closeOutline, personOutline, starOutline, trashOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-delete-account-modal',
  templateUrl: './delete-account-modal.component.html',
  styleUrls: ['./delete-account-modal.component.scss'],
  standalone: true,
  imports: [IonIcon, FormsModule],
})
export class DeleteAccountModalComponent {

  private _service = inject(ServiceService);
  private authService = inject(AuthService);
  private modalCtrl: ModalController = inject(ModalController);

  step: 'confirm' | 'deleting' | 'success' = 'confirm';
  password = '';
  passwordValid = false;
  passwordError = false;
  isConfirming = false;

  checkboxes = {
    data: false,
    services: false
  };

  constructor() {
    addIcons({
      closeOutline, trashOutline, personOutline, briefcaseOutline, chatbubblesOutline, starOutline,
      checkmarkCircle, closeCircle, alertCircle, checkmark
    });
  }

  get canDelete(): boolean {
    return this.password.length > 0 &&
      this.checkboxes.data &&
      this.checkboxes.services;
  }

  validatePassword(): void {
    // Resetear errores mientras escribe
    this.passwordError = false;
    this.passwordValid = this.password.length > 0;
  }

  toggleCheckbox(key: 'data' | 'services'): void {
    this.checkboxes[key] = !this.checkboxes[key];
  }

  async deleteAccount(): Promise<void> {
    if (!this.canDelete) return;

    this.isConfirming = true;

    // Pequeña pausa para la animación
    await new Promise(r => setTimeout(r, 300));

    this.step = 'deleting';

    // Aquí iría la llamada real al API con la contraseña
    try {
      const res = await this.authService.deleteAccount({ password: this.password });
      if (res.success) {
        // Simular llamada API
        setTimeout(() => {
          this.step = 'success';
        }, 2500);
      }
    } catch (error) {
      this.step = 'confirm';
      this.passwordError = true;
      this.isConfirming = false;
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.dismiss();
    }
  }

  dismiss(): void {
    this.modalCtrl.dismiss();
  }

  finish(): void {
    // Redirigir a login o splash
    this.modalCtrl.dismiss({ deleted: true });
  }

}
