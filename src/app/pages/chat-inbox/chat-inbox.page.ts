import { Component, inject, OnInit } from '@angular/core';
import { IonContent, IonButton, IonIcon, IonList } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkDoneOutline, createOutline, searchOutline } from 'ionicons/icons';
import { ConversationItemComponent } from 'src/app/components/conversation-item/conversation-item.component';
import { EmptyStateComponent } from 'src/app/components/empty-state/empty-state.component';
import { ChatService } from 'src/app/services/chat.service';
import { ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-chat-inbox',
  templateUrl: './chat-inbox.page.html',
  styleUrls: ['./chat-inbox.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, IonList, ConversationItemComponent, EmptyStateComponent]
})
export class ChatInboxPage implements OnInit {

  private _chatService: ChatService = inject(ChatService);
  private _service: ServiceService = inject(ServiceService);

  conversations: Array<any> = [];

  constructor() { 
    addIcons({
      searchOutline, createOutline, checkmarkDoneOutline
    });
  }

  ngOnInit() {
    this.getAllConversations();
  }

  async getAllConversations() {
    try {
      const result = await this._chatService.getConversations();
      console.log(result);
      this.conversations = result.data ?? [];
    } catch (error) {
      console.log(error);
    }
  }

  openConversation(conversation: any) {
    this._service.url(`/home/${conversation.id}/chat-conversation`);
    //this.router.navigate(['/chat/conversation', conversation.id]);
  }

  createNewMessage() {
    // Navegar o abrir modal para nuevo chat
  }

}
