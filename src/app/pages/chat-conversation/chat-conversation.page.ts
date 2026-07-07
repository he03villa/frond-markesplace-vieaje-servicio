import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonFooter, IonIcon, IonRefresher, IonRefresherContent, IonSkeletonText, IonButton } from '@ionic/angular/standalone';
import { ChatHeaderComponent } from 'src/app/components/chat-header/chat-header.component';
import { MessageBubbleComponent } from 'src/app/components/message-bubble/message-bubble.component';
import { TypingIndicatorComponent } from 'src/app/components/typing-indicator/typing-indicator.component';
import { MessageInputComponent } from 'src/app/components/message-input/message-input.component';
import { distinctUntilChanged, Subject, Subscription, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from 'src/app/services/chat.service';
import { ChatSocketService } from 'src/app/services/chat-socket.service';
import { AuthService } from 'src/app/services/auth.service';
import { ServiceService } from 'src/app/services/service.service';
import { addIcons } from 'ionicons';
import { arrowDown, chatbubblesOutline } from 'ionicons/icons';

@Component({
  selector: 'app-chat-conversation',
  templateUrl: './chat-conversation.page.html',
  styleUrls: ['./chat-conversation.page.scss'],
  standalone: true,
  imports: [IonContent, IonRefresher, IonRefresherContent, IonSkeletonText, CommonModule, FormsModule, ChatHeaderComponent, MessageBubbleComponent, TypingIndicatorComponent, MessageInputComponent, IonFooter, IonIcon, IonButton]
})
export class ChatConversationPage implements OnInit, OnDestroy {

  @ViewChild('content', { static: false }) content!: IonContent;
  @ViewChild('messagesContainer', { static: false }) messagesContainer!: HTMLDivElement;

  private route: ActivatedRoute = inject(ActivatedRoute);
  private chatService: ChatService = inject(ChatService);
  private webChatService: ChatSocketService = inject(ChatSocketService);
  private wsSubscriptions: Subscription[] = [];
  private authService: AuthService = inject(AuthService);
  private _service: ServiceService = inject(ServiceService);

  private routeSub!: Subscription;
  private conversationId!: number;

  private typingSubject = new Subject<boolean>();
  private destroy$ = new Subject<void>();
  private lastTypingState: boolean | null = null;

  conversation: any = null;
  messages: any[] = [];
  isTyping: boolean = false;
  isLoading = false;
  hasError = false;
  showScrollButton: boolean = false;
  contactName: string = '';
  user: any = this.authService.getCurrentUser();

  constructor() {
    addIcons({ arrowDown, chatbubblesOutline });
  }

  ngOnInit() {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      const user = params.get('user');
      if (id) {
        this.conversationId = +id;
        this.loadConversation();
      }
      if (user) {
        this.conversationId = +user;
        this.loadConversationUser();
      }
    });
    this.typingSubject.pipe(
      distinctUntilChanged(), // solo si cambia true→false o false→true
      takeUntil(this.destroy$)
    ).subscribe(isTyping => {
      this.lastTypingState = isTyping;
      this.chatService.broadcastTyping(this.conversationId, isTyping);
    });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
    this.wsSubscriptions.forEach(sub => sub.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
    if (this.conversationId) {
      this.webChatService.leaveChannel(`conversation.${this.conversationId}`);
    }
  }

  async loadConversation() {
    this.isLoading = true;
    try {
      const [res, resMessages, resRead] = await Promise.all([
        this.chatService.getConversation(this.conversationId),
        this.chatService.getMessages(this.conversationId),
        this.chatService.markAsRead(this.conversationId)
      ]);
      console.log(res, resMessages, resRead);
      this.conversation = res.data;
      this.contactName = res.data?.name ?? '';
      this.messages = resMessages.data ?? resMessages;
      this.scrollToBottom();
      this.connectToRealtimeUpdates(this.conversationId);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
      this._service.presentToast('Error al cargar mensajes', 'danger');
      this.hasError = true;
    }
    this.isLoading = false;
  }

  async loadConversationUser() {
    this.isLoading = true;
    console.log("USER",this.conversationId);
    try {
      const res = await this.chatService.getConversationUser(this.conversationId);
      console.log(res);
      this.conversation = res.data;
      this.contactName = res.data?.name ?? '';
      this.conversationId = res.data.id;
      if (res.data?.id) {
        const resMessages = await this.chatService.getMessages(res.data.id);
        console.log(resMessages);
        this.messages = resMessages.data ?? resMessages;
        this.scrollToBottom();
      }
      if (this.conversationId) {
        this.connectToRealtimeUpdates(this.conversationId);
      }
    } catch (error) {
      console.log(error);
      this._service.presentToast('Error al cargar conversación', 'danger');
      this.hasError = true;
    }
    this.isLoading = false;
  }

  async handleRefresh(event: any) {
    if (this.conversationId) {
      await this.loadConversation();
    }
    event.target.complete();
  }

  goBack(): void {
    this._service.url('/home/chat-inbox');
  }

  openProfile(): void {
    if (this.conversation?.contact?.id) {
      this._service.url('/home/profile');
    }
  }

  /**
   * Determina si es el primer mensaje de un grupo consecutivo del mismo remitente
   */
  isFirstInGroup(msg: any, index: number): boolean {
    if (index === 0) return true;
    const prev = this.messages[index - 1];
    return prev.sender_id !== msg.sender_id;
  }

  /**
   * Determina si es el último mensaje de un grupo consecutivo del mismo remitente
   */
  isLastInGroup(msg: any, index: number): boolean {
    if (index === this.messages.length - 1) return true;
    const next = this.messages[index + 1];
    return next.sender_id !== msg.sender_id;
  }

  /**
   * Formatea la fecha para el divider sticky (Hoy, Ayer, etc.)
   */
  formatDateDivider(isoString: string | null): string {
    if (!isoString) return '';

    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';

    return date.toLocaleDateString('es', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  async sendMessage(event: { text: string; files?: File[] }) {
    const { text, files } = event;

    if (!text?.trim() && (!files || files.length === 0)) return;
    console.log(event, this.conversation);

    try {
      const result = await this.chatService.sendMessage(this.conversation.contact.id, text, files);
      const newMsg = result.data.message;
      console.log(result); 
      const pos = this.messages.findIndex((m) => m.id === newMsg.id);
      if (pos === -1) {
        this.messages.push(newMsg);
      }
      if (!this.conversation?.id) {
        this.conversation = result.data.conversation;
        this.conversationId = this.conversation.id;
        this.connectToRealtimeUpdates(this.conversationId);
      }
      this.scrollToBottom();
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      this._service.presentToast('Error al enviar mensaje', 'danger');
    }
  }

  async broadcastTyping(isTyping: boolean): Promise<void> {
    this.typingSubject.next(isTyping);
  }

  handleAttachment(files: File[]): void {
    // Si tu MessageInputComponent emite archivos directamente, 
    // puedes reutilizar sendMessage o manejarlo aparte
    this.sendMessage({ text: '', files });
  }

  scrollToBottom(): void {
    this.content?.scrollToBottom(300);
  }

  onScroll(ev: CustomEvent): void {
    const detail = ev.detail as { scrollTop: number; scrollHeight: number; clientHeight: number };
    const distanceFromBottom = detail.scrollHeight - detail.scrollTop - detail.clientHeight;
    this.showScrollButton = distanceFromBottom > 200;
  }

  connectToRealtimeUpdates(serviceId: number) {
    // Conectar WebSocket si no está conectado
    if (!this.webChatService.isConnected()) {
      this.webChatService.connect();
    }

    // Escuchar todos los eventos del servicio
    this.webChatService.listenToConversation(serviceId, (data) => {
      console.log('🚗 Ride event:', data);
      switch (data.type) {
        case 'typing':
          if (this.user.id !== data.typing_user_id) {
            this.isTyping = data.is_typing;
            this.scrollToBottom();
          }
          break;
        case 'message.sent':
          const dataMensaje = {
            attachments: data.attachments,
            body: data.body,
            conversation_id: data.conversation_id,
            id: data.id,
            read_at: data.read_at,
            sender: data.sender,
            created_at: data.created_at,
            is_mine: this.user?.id === data.sender.id
          };
          const pos = this.messages.findIndex((m) => m.id === data.id);
          if (pos === -1) {
            this.messages.push(dataMensaje);
            this.chatService.markAsRead(this.conversationId)
          }
          this.conversation.last_message_at = data.last_message_at;
          this.scrollToBottom();
          break;
        case 'messages.read':
          this.messages.forEach((m) => {
            if (m.conversation_id === data.conversation_id) {
              m.read_at = data.read_at;
            } 
          })
          break;
      }
    });
  }

}
