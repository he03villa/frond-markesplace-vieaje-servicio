import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, notificationsOutline, arrowForward, timeOutline, checkmarkCircleOutline, alertCircleOutline, informationCircleOutline, starOutline, carOutline, briefcaseOutline, chatbubbleOutline } from 'ionicons/icons';
import { NotificationService } from 'src/app/services/notification.service';
import { ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-notifications-sidebar',
  templateUrl: './notifications-sidebar.component.html',
  styleUrls: ['./notifications-sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class NotificationsSidebarComponent implements OnChanges {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  @Output() viewAll = new EventEmitter<void>();

  private _notificationService: NotificationService = inject(NotificationService);
  private _service: ServiceService = inject(ServiceService);

  notifications: any[] = [];
  loading = false;
  animating = false;

  constructor() {
    addIcons({
      close, notificationsOutline, arrowForward, timeOutline,
      checkmarkCircleOutline, alertCircleOutline, informationCircleOutline,
      starOutline, carOutline, briefcaseOutline, chatbubbleOutline
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['show'] && changes['show'].currentValue && !changes['show'].firstChange) {
      if (localStorage.getItem('token')) {
        this.loadNotifications();
      }
    }
  }

  async loadNotifications() {
    if (!localStorage.getItem('token')) return;
    this.loading = true;
    try {
      const res: any = await this._notificationService.getNotifications(1, 5);
      if (res.success) {
        this.notifications = res.data.notifications || [];
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
    this.loading = false;
  }

  getNotificationIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'offer_created': 'briefcase-outline',
      'offer_accepted': 'checkmark-circle-outline',
      'offer_rejected': 'alert-circle-outline',
      'passenger_joined': 'car-outline',
      'passenger_status_changed': 'car-outline',
      'ride_status_changed': 'car-outline',
      'delivery_status_changed': 'chatbubble-outline',
      'message_received': 'chatbubble-outline',
      'review_received': 'star-outline',
    };
    return iconMap[type] || 'notifications-outline';
  }

  getTimeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Ahora';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  onBackdropClick() {
    this.close.emit();
  }

  onViewAll() {
    this.viewAll.emit();
  }

  trackById(index: number, item: any) {
    return item.id;
  }
}
