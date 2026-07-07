import { Component, inject, OnInit } from '@angular/core';
import { IonContent, IonButton, IonIcon, IonList, IonButtons, IonSkeletonText, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { PageHeaderComponent } from 'src/app/components/page-header/page-header.component';
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
  imports: [IonContent, IonButton, IonIcon, IonList, IonButtons, IonSkeletonText, IonRefresher, IonRefresherContent, ConversationItemComponent, EmptyStateComponent, PageHeaderComponent]
})
export class ChatInboxPage implements OnInit {

  private _chatService: ChatService = inject(ChatService);
  private _service: ServiceService = inject(ServiceService);

  conversations: Array<any> = [];
  isLoading = false;
  hasError = false;

  constructor() { 
    addIcons({
      searchOutline, createOutline, checkmarkDoneOutline
    });
  }

  ngOnInit() {
    this.getAllConversations();
  }

  async getAllConversations() {
    this.isLoading = true;
    try {
      const result = await this._chatService.getConversations();
      console.log(result);
      this.conversations = result.data ?? [];
    } catch (error) {
      console.log(error);
      this._service.presentToast('Error al cargar conversaciones', 'danger');
      this.hasError = true;
    }
    this.isLoading = false;
  }

  openConversation(conversation: any) {
    this._service.url(`/home/${conversation.id}/chat-conversation`);
    //this.router.navigate(['/chat/conversation', conversation.id]);
  }

  async handleRefresh(event: any) {
    await this.getAllConversations();
    event.target.complete();
  }

  createNewMessage() {
    // Navegar o abrir modal para nuevo chat
  }

}
