import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  close, personOutline, briefcaseOutline, carOutline, statsChartOutline,
  settingsOutline, logOutOutline, chevronForward
} from 'ionicons/icons';
import { ServiceService } from 'src/app/services/service.service';
import { AuthService } from 'src/app/services/auth.service';

export interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-menu-sidebar',
  templateUrl: './menu-sidebar.component.html',
  styleUrls: ['./menu-sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class MenuSidebarComponent {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();

  private _service: ServiceService = inject(ServiceService);
  private _authService: AuthService = inject(AuthService);

  readonly menuItems: MenuItem[] = [
    { icon: 'person-outline', label: 'Perfil', route: '/home/profile' },
    { icon: 'briefcase-outline', label: 'Mis Servicios', route: '/home/my-services' },
    { icon: 'car-outline', label: 'Mis Viajes', route: '/home/my-rides' },
    { icon: 'stats-chart-outline', label: 'Estadísticas', route: '/home/stats' },
    { icon: 'settings-outline', label: 'Configuración', route: '/home/settings' },
  ];

  get user() {
    return this._authService.getCurrentUser();
  }

  constructor() {
    addIcons({
      close, personOutline, briefcaseOutline, carOutline, statsChartOutline,
      settingsOutline, logOutOutline, chevronForward
    });
  }

  onBackdropClick() {
    this.close.emit();
  }

  navigate(route: string) {
    this.close.emit();
    this._service.url(route);
  }

  async logout() {
    this.close.emit();
    try {
      await this._authService.logout();
    } catch { }
    this._service.logout();
  }

  onAvatarError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
