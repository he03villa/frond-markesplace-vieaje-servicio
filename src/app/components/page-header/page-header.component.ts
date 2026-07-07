import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, searchOutline, closeOutline } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, FormsModule]
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() showBack: boolean = true;
  @Input() backIcon: string = 'arrow-back-outline';
  @Input() solid: boolean = false;
  @Input() overlay: boolean = false;
  @Input() showSearch: boolean = false;
  @Input() searchQuery: string = '';
  @Output() back = new EventEmitter<void>();
  @Output() searchQueryChange = new EventEmitter<string>();

  constructor() {
    addIcons({ arrowBackOutline, searchOutline, closeOutline });
  }
}
