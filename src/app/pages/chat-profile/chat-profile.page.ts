import { Component, inject } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { PageHeaderComponent } from 'src/app/components/page-header/page-header.component';
import { ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-chat-profile',
  templateUrl: './chat-profile.page.html',
  styleUrls: ['./chat-profile.page.scss'],
  standalone: true,
  imports: [IonContent, PageHeaderComponent]
})
export class ChatProfilePage {

  private _service: ServiceService = inject(ServiceService);

  constructor() { }

  back() {
    this._service.url('/home/chat-inbox');
  }

}
