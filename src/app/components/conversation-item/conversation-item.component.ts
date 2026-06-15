import { Component, Input, OnInit } from '@angular/core';
import { IonIcon } from "@ionic/angular/standalone";

@Component({
  selector: 'app-conversation-item',
  templateUrl: './conversation-item.component.html',
  styleUrls: ['./conversation-item.component.scss'],
  standalone: true,
  imports: [IonIcon]
})
export class ConversationItemComponent  implements OnInit {

  @Input() conversation: any;
  @Input() index: number = 0;

  constructor() { }

  get contactOnline(): boolean {
    return this.conversation?.contact?.online ?? false;
  }

  get lastMessageIsMine(): boolean {
    return this.conversation?.last_message?.is_mine ?? false;
  }

  ngOnInit() {}

  /**
   * Determina si un mensaje es reciente (menos de 24h)
   * para aplicar el color de highlight al timestamp
   */
  isRecent(isoString: string | null | undefined): boolean {
    if (!isoString) return false;
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours < 24;
  }

  /**
   * Formatea la fecha del último mensaje a formato relativo
   */
  formatTime(isoString: string | null | undefined): string {
    if (!isoString) return '';
    
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'Ahora';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  }

}
