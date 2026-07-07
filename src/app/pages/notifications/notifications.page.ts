import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonRefresher, IonRefresherContent,
  IonInfiniteScroll, IonInfiniteScrollContent, IonIcon,
  IonButtons, IonButton, IonFab, IonFabButton
} from '@ionic/angular/standalone';
import { PageHeaderComponent } from 'src/app/components/page-header/page-header.component';
import { addIcons } from 'ionicons';
import {
  arrowBack, arrowUp, notifications, notificationsOutline, checkmarkDone, timeOutline,
  briefcaseOutline, carOutline, chatbubbleOutline, starOutline, alertCircleOutline,
  checkmarkCircleOutline, informationCircleOutline, chevronForward
} from 'ionicons/icons';
import { NotificationService } from 'src/app/services/notification.service';
import { ServiceService } from 'src/app/services/service.service';

interface NotificationGroup {
  label: string;
  items: any[];
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonContent, IonRefresher, IonRefresherContent,
    IonInfiniteScroll, IonInfiniteScrollContent, IonIcon,
    IonButtons, IonButton, IonFab, IonFabButton, PageHeaderComponent
  ]
})
export class NotificationsPage implements OnInit {
  private _notificationService: NotificationService = inject(NotificationService);
  private _service: ServiceService = inject(ServiceService);

  notifications: any[] = [];
  unreadCount = 0;
  loading = false;
  hasError = false;
  showScrollTop = false;
  page = 1;
  lastPage = 1;
  perPage = 15;

  constructor() {
    addIcons({
      arrowBack, arrowUp, notifications, notificationsOutline, checkmarkDone, timeOutline,
      briefcaseOutline, carOutline, chatbubbleOutline, starOutline, alertCircleOutline,
      checkmarkCircleOutline, informationCircleOutline, chevronForward
    });
  }

  get groupedNotifications(): NotificationGroup[] {
    const groups: NotificationGroup[] = [];
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    let currentGroup: NotificationGroup | null = null;

    for (const notif of this.notifications) {
      const date = new Date(notif.created_at);
      let label: string;

      if (date >= todayStart) {
        label = 'Hoy';
      } else if (date >= yesterdayStart) {
        label = 'Ayer';
      } else if (date >= weekStart) {
        label = 'Esta semana';
      } else {
        label = 'Anterior';
      }

      if (!currentGroup || currentGroup.label !== label) {
        currentGroup = { label, items: [] };
        groups.push(currentGroup);
      }
      currentGroup.items.push(notif);
    }

    return groups;
  }

  ngOnInit() {
    this.loadNotifications();
  }

  async loadNotifications() {
    this.loading = true;
    try {
      const res: any = await this._notificationService.getNotifications(this.page, this.perPage);
      if (res.success) {
        if (this.page === 1) {
          this.notifications = res.data.notifications || [];
        } else {
          this.notifications = [...this.notifications, ...(res.data.notifications || [])];
        }
        this.unreadCount = res.data.unread_count || 0;
        this.lastPage = res.data.last_page || 1;
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.hasError = true;
    }
    this.loading = false;
  }

  async loadMore(event: any) {
    if (this.page >= this.lastPage) {
      event.target.disabled = true;
      return;
    }
    this.page++;
    await this.loadNotifications();
    event.target.complete();
  }

  async doRefresh(event: any) {
    this.page = 1;
    await this.loadNotifications();
    event.target.complete();
  }

  async markAsRead(notif: any) {
    if (notif.read_at) {
      this.navigateToAction(notif);
      return;
    }
    try {
      const res: any = await this._notificationService.markAsRead(notif.id);
      if (res.success) {
        notif.read_at = new Date().toISOString();
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
    this.navigateToAction(notif);
  }

  async markAllAsRead() {
    try {
      const res: any = await this._notificationService.markAllAsRead();
      if (res.success) {
        this.notifications.forEach(n => {
          if (!n.read_at) n.read_at = new Date().toISOString();
        });
        this.unreadCount = 0;
        this._service.presentToast('Todas marcadas como leídas', 'success');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  private navigateToAction(notif: any) {
    if (notif.action_url) {
      this._service.url(notif.action_url);
    }
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

  getAccentColor(type: string): string {
    const map: { [key: string]: string } = {
      'offer_created': 'var(--primary-color)',
      'offer_accepted': 'var(--ion-color-success)',
      'offer_rejected': 'var(--ion-color-danger)',
      'passenger_joined': 'var(--ion-color-tertiary)',
      'passenger_status_changed': 'var(--ion-color-tertiary)',
      'ride_status_changed': 'var(--ion-color-tertiary)',
      'delivery_status_changed': 'var(--app-info)',
      'message_received': 'var(--app-info)',
      'review_received': 'var(--ion-color-warning)',
    };
    return map[type] || 'var(--primary-color)';
  }

  getIconBg(type: string): string {
    const map: { [key: string]: string } = {
      'offer_created': 'var(--app-focus-bg)',
      'offer_accepted': 'var(--app-success-light)',
      'offer_rejected': 'var(--app-danger-light)',
      'passenger_joined': 'rgba(245, 158, 11, 0.15)',
      'passenger_status_changed': 'rgba(245, 158, 11, 0.15)',
      'ride_status_changed': 'rgba(245, 158, 11, 0.15)',
      'delivery_status_changed': 'rgba(59, 130, 246, 0.15)',
      'message_received': 'rgba(59, 130, 246, 0.15)',
      'review_received': 'rgba(245, 158, 11, 0.15)',
    };
    return map[type] || 'var(--app-focus-bg)';
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

  onScroll(ev: any) {
    this.showScrollTop = ev.detail.scrollTop > 400;
  }

  scrollToTop() {
    const content: any = document.querySelector('ion-content.notif-content');
    content?.scrollToTop(500);
  }

  back() {
    this._service.url('/home/home');
  }

  trackById(index: number, item: any) {
    return item.id;
  }
}
