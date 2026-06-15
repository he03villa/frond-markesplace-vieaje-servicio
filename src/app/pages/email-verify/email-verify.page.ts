import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { ServiceService } from 'src/app/services/service.service';
import { ActivatedRoute } from '@angular/router';
import { VerifyState, VerifyStatus } from 'src/app/interface/email-verify';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, checkmarkCircleOutline, closeCircleOutline, homeOutline, logInOutline, mailOutline, refreshOutline, shieldCheckmarkOutline, warningOutline } from 'ionicons/icons';

@Component({
  selector: 'app-email-verify',
  templateUrl: './email-verify.page.html',
  styleUrls: ['./email-verify.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonIcon]
})
export class EmailVerifyPage implements OnInit {

  private route = inject(ActivatedRoute);
  private _service: ServiceService = inject(ServiceService);

  currentStatus: VerifyStatus = 'loading';
  isAnimating = true;

  states: Record<VerifyStatus, VerifyState> = {
    loading: {
      status: 'loading',
      title: 'Verificando...',
      message: 'Estamos confirmando tu dirección de email',
      icon: 'mail-outline',
      iconColor: '#4f46e5',
      iconBg: 'rgba(79,70,229,0.1)',
      gradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      primaryAction: { label: 'Espere...', route: '', icon: 'refresh-outline' }
    },
    success: {
      status: 'success',
      title: '¡Email verificado!',
      message: 'Tu cuenta ha sido activada correctamente. Ya puedes iniciar sesión y disfrutar de todos los servicios.',
      icon: 'shield-checkmark-outline',
      iconColor: '#10b981',
      iconBg: 'rgba(16,185,129,0.1)',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      primaryAction: { label: 'Iniciar sesión', route: '/login', icon: 'log-in-outline' },
      secondaryAction: { label: 'Ir al inicio', route: '/home', icon: 'home-outline' }
    },
    already_verified: {
      status: 'already_verified',
      title: 'Ya estabas verificado',
      message: 'Tu email ya fue confirmado anteriormente. No necesitas hacer nada más, tu cuenta está activa.',
      icon: 'checkmark-circle-outline',
      iconColor: '#3b82f6',
      iconBg: 'rgba(59,130,246,0.1)',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      primaryAction: { label: 'Iniciar sesión', route: '/login', icon: 'log-in-outline' },
      secondaryAction: { label: 'Ir al inicio', route: '/home', icon: 'home-outline' }
    },
    invalid: {
      status: 'invalid',
      title: 'Enlace inválido',
      message: 'El enlace de verificación ha expirado o no es válido. Solicita uno nuevo para verificar tu cuenta.',
      icon: 'close-circle-outline',
      iconColor: '#ef4444',
      iconBg: 'rgba(239,68,68,0.1)',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      primaryAction: { label: 'Solicitar nuevo', route: '/resend-verification', icon: 'refresh-outline' },
      secondaryAction: { label: 'Ir al inicio', route: '/home', icon: 'home-outline' }
    },
    error: {
      status: 'error',
      title: 'Algo salió mal',
      message: 'No pudimos completar la verificación. Por favor intenta de nuevo más tarde.',
      icon: 'warning-outline',
      iconColor: '#f59e0b',
      iconBg: 'rgba(245,158,11,0.1)',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      primaryAction: { label: 'Intentar de nuevo', route: '', icon: 'refresh-outline' },
      secondaryAction: { label: 'Ir al inicio', route: '/home', icon: 'home-outline' }
    }
  };

  get state(): VerifyState {
    return this.states[this.currentStatus];
  }

  constructor() {
    addIcons({
      checkmarkCircleOutline, closeCircleOutline, warningOutline,
      mailOutline, shieldCheckmarkOutline, arrowForwardOutline,
      refreshOutline, homeOutline, logInOutline
    });
  }

  ngOnInit() {
    const status = this.route.snapshot.queryParamMap.get('status') as VerifyStatus;

    if (status && this.states[status]) {
      // Simulate verification process for UX
      this.currentStatus = 'loading';
      setTimeout(() => {
        this.currentStatus = status;
        this.triggerAnimation();
      }, 1500);
    } else {
      // No status param — maybe direct access, show error
      this.currentStatus = 'error';
      this.triggerAnimation();
    }
  }

  triggerAnimation() {
    this.isAnimating = false;
    setTimeout(() => this.isAnimating = true, 50);
  }

  navigate(route: string) {
    if (!route) {
      this.triggerAnimation();
      return;
    }
    this._service.url(route);
  }

  retry() {
    this.currentStatus = 'loading';
    setTimeout(() => {
      const status = this.route.snapshot.queryParamMap.get('status') as VerifyStatus;
      this.currentStatus = status && this.states[status] ? status : 'error';
      this.triggerAnimation();
    }, 1000);
  }

}
