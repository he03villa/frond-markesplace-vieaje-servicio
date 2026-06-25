import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-chat-profile',
  templateUrl: './chat-profile.page.html',
  styleUrls: ['./chat-profile.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar]
})
export class ChatProfilePage {

  constructor() { }

}
