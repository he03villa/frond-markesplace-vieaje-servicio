import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonRefresher, IonRefresherContent, IonToggle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, arrowDown, arrowUpOutline, calendarOutline, cameraOutline, chevronForwardOutline, colorPaletteOutline, documentTextOutline, eyeOffOutline, eyeOutline, fingerPrintOutline, globeOutline, helpCircleOutline, informationCircleOutline, lockClosedOutline, logOutOutline, mailOutline, moonOutline, notificationsOutline, personOutline, phonePortraitOutline, shieldCheckmarkOutline, shieldOutline, trashOutline, volumeHighOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { ServiceService } from 'src/app/services/service.service';
import { ModalEditUserComponent } from 'src/app/components/modal-edit-user/modal-edit-user.component';
import { ModalCambiarPasswordComponent } from 'src/app/components/modal-cambiar-password/modal-cambiar-password.component';
import { ThemeService } from 'src/app/services/theme.service';
import { DeleteAccountModalComponent } from 'src/app/components/delete-account-modal/delete-account-modal.component';
import { AppVersionService } from 'src/app/services/app-version.service';

interface SettingSection {
  title: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  items: SettingItem[];
}

interface SettingItem {
  label: string;
  description?: string;
  icon?: string;
  type: 'toggle' | 'link' | 'action' | 'select';
  value?: boolean;
  valueLabel?: string;
  danger?: boolean;
  action?: () => void;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, IonButtons, IonButton, IonIcon, IonRefresher, IonRefresherContent, IonToggle]
})
export class SettingsPage implements OnInit {

  _service = inject(ServiceService);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private appVersionService = inject(AppVersionService);

  headerSolid = false;
  isLoading = true;
  darkMode = false;
  notifications = true;
  biometric = false;
  showEmail = true;
  appVersion = 'v2.4.1';
  appBuild = '892';

  userProfile = {
    name: '',
    email: '',
    phone: '',
    avatar: '',
    verified: true,
    memberSince: '',
    title: '',
    bio: '',
    location: ''
  };

  stateProfile = {
    rating: 0,
    rides: 0,
    earnings: 0
  };

  sections: SettingSection[] = [
    {
      title: 'Cuenta',
      icon: 'person-outline',
      iconColor: '#3b82f6',
      iconBg: 'rgba(59,130,246,0.1)',
      items: [
        { label: 'Editar perfil', description: 'Nombre, foto, información personal', icon: 'person-outline', type: 'link', action: () => this.openEditModal() },
        { label: 'Cambiar contraseña', description: 'Actualiza tu contraseña de acceso', icon: 'lock-closed-outline', type: 'link', action: () => this.openPasswordModal() },
        { label: 'Verificación', description: 'Verifica tu identidad', icon: 'shield-outline', type: 'link', valueLabel: 'Verificado', action: () => this.sendVerificationEmail() },
      ]
    },
    {
      title: 'Preferencias',
      icon: 'color-palette-outline',
      iconColor: '#8b5cf6',
      iconBg: 'rgba(139,92,246,0.1)',
      items: [
        { label: 'Modo oscuro', description: 'Cambia la apariencia de la app', icon: 'moon-outline', type: 'toggle', value: this.isDarkMode },
        { label: 'Notificaciones', description: 'Configura alertas y sonidos', icon: 'notifications-outline', type: 'toggle', value: this.notifications },
        /* { label: 'Biométrico', description: 'Desbloqueo con huella o rostro', icon: 'finger-print-outline', type: 'toggle', value: false },
        { label: 'Idioma', description: 'Español (Argentina)', icon: 'globe-outline', type: 'select', valueLabel: 'Español' } */
      ]
    },
    /* {
      title: 'Privacidad',
      icon: 'shield-outline',
      iconColor: '#10b981',
      iconBg: 'rgba(16,185,129,0.1)',
      items: [
        { label: 'Visibilidad del email', description: 'Mostrar email en perfil público', icon: 'mail-outline', type: 'toggle', value: true },
        { label: 'Visibilidad del teléfono', description: 'Mostrar teléfono en perfil público', icon: 'phone-portrait-outline', type: 'toggle', value: false },
        { label: 'Términos y condiciones', icon: 'document-text-outline', type: 'link' },
        { label: 'Política de privacidad', icon: 'document-text-outline', type: 'link' }
      ]
    }, */
    {
      title: 'Soporte',
      icon: 'help-circle-outline',
      iconColor: '#f59e0b',
      iconBg: 'rgba(245,158,11,0.1)',
      items: [
        /* { label: 'Centro de ayuda', description: 'Preguntas frecuentes y guías', icon: 'help-circle-outline', type: 'link' },
        { label: 'Contactar soporte', description: 'Envía un mensaje al equipo', icon: 'mail-outline', type: 'link' }, */
        { label: 'Versión de la app', description: 'v2.4.1 (build 892)', icon: 'information-circle-outline', type: 'link' }
      ]
    },
    {
      title: 'Zona de riesgo',
      icon: 'trash-outline',
      iconColor: '#ef4444',
      iconBg: 'rgba(239,68,68,0.1)',
      items: [
        { label: 'Cerrar sesión', icon: 'log-out-outline', type: 'action', danger: true, action: () => this.logout() },
        { label: 'Eliminar cuenta', icon: 'trash-outline', type: 'action', danger: true, action: () => this.deleteAccount() }
      ]
    }
  ];

  constructor() {
    addIcons({
      arrowBackOutline, personOutline, notificationsOutline, shieldOutline,
      moonOutline, globeOutline, helpCircleOutline, informationCircleOutline,
      logOutOutline, chevronForwardOutline, colorPaletteOutline, volumeHighOutline,
      fingerPrintOutline, mailOutline, phonePortraitOutline, trashOutline,
      documentTextOutline, lockClosedOutline, eyeOutline, eyeOffOutline, arrowUpOutline, arrowDown,
      cameraOutline, shieldCheckmarkOutline, calendarOutline
    });
  }

  get isDarkMode(): boolean {
    return this.themeService.isDark();
  }

  ngOnInit() {
    this.simulateLoad();
  }

  onScroll(ev: any) {
    this.headerSolid = ev.detail.scrollTop > 60;
  }

  scrollToTop() {
    document.querySelector('ion-content')?.scrollToTop(500);
  }

  back() {
    this._service.url('/home');
  }

  async simulateLoad() {
    this.isLoading = true;
    try {
      const res = await this.authService.getProfile();
      console.log(res);
      if (res.success) {
        this.userProfile.name = res.data.name;
        this.userProfile.email = res.data.email;
        this.userProfile.phone = res.data.phone;
        this.userProfile.avatar = res.data.avatar;
        this.userProfile.verified = res.data.verified;
        this.userProfile.memberSince = res.data.member_since;
        this.userProfile.title = res.data.title;
        this.userProfile.bio = res.data.bio;
        this.userProfile.location = res.data.location;

        this.stateProfile.rating = res.data.rating;
        this.stateProfile.earnings = res.data.total_earned;
        this.stateProfile.rides = res.data.total_trips;

        this.sections[0].items[2].icon = this.userProfile.verified ? 'shield-checkmark-outline' : 'shield-outline';
        this.sections[0].items[2].valueLabel = this.userProfile.verified ? 'Verificado' : 'No verificado';

        this.sections[1].items[1].value = res.data.has_notification || false;

        const info = await this.appVersionService.getAppInfo();
        this.appVersion = `v${info.version}`;
        this.appBuild = info.build;

        this.sections[2].items[0].description = `v${info.version} (build ${info.build})`;
      }
    } catch (error) {
      console.log(error);
    }
    this.isLoading = false;
  }

  async handleRefresh(ev: any) {
    await new Promise(r => setTimeout(r, 600));
    this.isLoading = false;
    ev.target.complete();
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    this.themeService.toggleTheme();
  }

  async toggleNotifications() {
    this.notifications = !this.notifications;
    try {
      const data = { has_notification: this.notifications };
      const res = await this.authService.updateHasNotification(data);
      if (res.success) {
        this._service.Toast({
          message: 'Notificaciones actualizadas',
          color: 'success',
          duration: 1500
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  toggleBiometric() {
    this.biometric = !this.biometric;
  }

  toggleEmailVisibility() {
    this.showEmail = !this.showEmail;
  }

  onItemClick(item: SettingItem) {
    if (item.type === 'toggle') return;
    if (item.action) {
      item.action();
    }
    console.log('Clicked:', item.label);
  }

  async logout() {
    const loading = await this._service.presentLoading('Cerrando sesión...');
    loading.present();
    try {
      const res = await this.authService.logout();
      if (res.success) {
        this.authService.emitUser(null);
        loading.dismiss();
        this._service.logout();
      }
    } catch (error) {
      console.log(error);
      loading.dismiss();
    }
  }

  async deleteAccount() {
    const resul = await this._service.openModal(DeleteAccountModalComponent, {}, { cssClass: 'delete-account-modal' });
    if (resul.data.deleted) {
      this.authService.emitUser(null);
      this._service.logout();
    }
  }

  async openEditModal() {
    const data = {
      editName : this.userProfile?.name || '',
      editTitle : this.userProfile?.title || '',
      editBio : this.userProfile?.bio || '',
      tempAvatar : this.userProfile?.avatar || '',
      editLocation : this.userProfile?.location || '',
      editPhone : this.userProfile?.phone || ''
    };
    const result = await this._service.openModal(ModalEditUserComponent, { data }, { cssClass: 'modal-edit-user' });
    if (result.data) {
      this.userProfile.name = result.data.editName;
      this.userProfile.title = result.data.editTitle;
      this.userProfile.bio = result.data.editBio;
      this.userProfile.avatar = result.data.tempAvatar;
      this.userProfile.location = result.data.editLocation;
      this.userProfile.phone = result.data.editPhone;
      await this.showToast('Perfil actualizado correctamente', 'success');
    }
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this._service.Toast({
      message,
      duration: 2500,
      position: 'bottom',
      color,
      cssClass: 'custom-toast',
      buttons: [{ icon: 'close-outline', role: 'cancel' }]
    });
  }

  openPasswordModal() {
    this._service.openModal(ModalCambiarPasswordComponent, {}, { cssClass: 'password-modal' });
  }

  async sendVerificationEmail() {
    const loading = await this._service.presentLoading('Enviando correo de verificación...');
    loading.present();
    try {
      const res = await this.authService.sendVerifyEmail({});
      if (res.success) {
        loading.dismiss();
        await this.showToast('Correo de verificación enviado correctamente', 'success');
      }
    } catch (error) {
      console.log(error);
      loading.dismiss();
    }
  }

}
