import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { addIcons } from 'ionicons';
import { callOutline, chevronBack, ellipsisVertical, videocamOutline } from 'ionicons/icons';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon } from "@ionic/angular/standalone";

@Component({
  selector: 'app-chat-header',
  templateUrl: './chat-header.component.html',
  styleUrls: ['./chat-header.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonButtons, IonButton, IonIcon]
})
export class ChatHeaderComponent implements OnInit {

  @Input() contact: any;
  @Input() typing: boolean = false;

  @Output() back = new EventEmitter<void>();
  @Output() profile = new EventEmitter<void>();

  isCollapsed: boolean = false;

  constructor() {
    addIcons({
      chevronBack, videocamOutline, callOutline, ellipsisVertical
    });
  }

  /**
   * Formatea la última vez que se vio al contacto
   * Ejemplo: "Últ. vez hace 2h" o "Últ. vez ayer"
   */
  get lastSeen(): string {
    // Si está online, no mostramos "last seen"
    if (this.contact?.online) return '';

    const isoString = this.contact?.last_seen || this.contact?.last_message_at;
    if (!isoString) return '';

    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'Últ. vez ahora';
    if (diffMinutes < 60) return `Últ. vez hace ${diffMinutes}m`;
    if (diffHours < 24) return `Últ. vez hace ${diffHours}h`;
    if (diffDays === 1) return 'Últ. vez ayer';
    if (diffDays < 7) return `Últ. vez hace ${diffDays}d`;

    return 'Últ. vez ' + date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  }

  ngOnInit() { }

  onBack() {
    this.back.emit();
  }

  onProfile() {
    this.profile.emit();
  }

  collapse(value: boolean): void {
    this.isCollapsed = value;
  }

}
