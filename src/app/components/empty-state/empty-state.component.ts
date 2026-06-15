import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { addIcons } from 'ionicons';
import { IonIcon, IonButton } from "@ionic/angular/standalone";
import { chatbubblesOutline, mailOutline, notificationsOutline, searchOutline } from 'ionicons/icons';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
  standalone: true,
  imports: [IonIcon, IonButton]
})
export class EmptyStateComponent  implements OnInit {

  @Input() icon: string = 'chatbubbles-outline';
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() actionText: string = '';

  @Output() action = new EventEmitter<void>();

  private iconMap: Record<string, any> = {
    'chatbubbles-outline': chatbubblesOutline,
    'search-outline': searchOutline,
    'mail-outline': mailOutline,
    'notifications-outline': notificationsOutline,
  };

  constructor() {
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['icon']?.currentValue) {
      const iconName = changes['icon'].currentValue;
      if (this.iconMap[iconName]) {
        addIcons({ [iconName]: this.iconMap[iconName] });
      }
    }
  }

}
