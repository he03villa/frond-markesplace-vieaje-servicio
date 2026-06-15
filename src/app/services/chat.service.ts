import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DataService } from './data.service';
import { ServiceService } from './service.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Conversation } from '../interface/conversation';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUser = `${environment.apiUrl}/${environment.api.chat.name}`;
  private _data: DataService = inject(DataService);
  private _service: ServiceService = inject(ServiceService);

  private conversations$ = new BehaviorSubject<Conversation[]>([]);
  private activeConversation$ = new BehaviorSubject<number | null>(null);

  getConversations() {
    const url = `${this.apiUser}/${environment.api.chat.services.conversations}`;
    return this._service.promise(this._data.metodoGet(url));
  }

  getConversation(id: number) {
    const url = `${this.apiUser}/${environment.api.chat.services.conversations}/${id}`;
    return this._service.promise(this._data.metodoGet(url));
  }

  getMessages(conversationId: number, perPage = 30) {
    const url = `${this.apiUser}/${environment.api.chat.services.conversations}/${conversationId}/${environment.api.chat.services.messages}?perPage=${perPage}`;
    return this._service.promise(this._data.metodoGet(url));
  }

  sendMessage(receiverId: number, body: string, files?: File[]) {
    const url = `${this.apiUser}/${environment.api.chat.services.messages}`;
    const formData = new FormData();
    formData.append('receiver_id', receiverId.toString());
    if (body) formData.append('body', body);
    if (files) {
      files.forEach((file, i) => {
        // 👇 Agrega esto
        console.log(`Archivo ${i} MIME real:`, file.type, '| size:', file.size);
        
        // Ver los primeros bytes reales
        const reader = new FileReader();
        reader.onload = (e) => {
          const arr = new Uint8Array(e.target!.result as ArrayBuffer);
          const hex = Array.from(arr.slice(0, 8)).map(b => b.toString(16).padStart(2,'0')).join(' ');
          console.log(`  → Primeros bytes [${i}]: ${hex}`);
          // Un PDF real debe empezar con: 25 50 44 46 (%PDF)
        };
        reader.readAsArrayBuffer(file.slice(0, 8));

        formData.append('files[]', file);
      });
    }
    return this._service.promise(this._data.metodoPost(url, formData));
  }

  markAsRead(conversationId: number) {
    const url = `${this.apiUser}/${environment.api.chat.services.conversations}/${conversationId}/${environment.api.chat.services.read}`;
    return this._service.promise(this._data.metodoPatch(url, {}));
  }

  deleteMessage(messageId: number) {
    const url = `${this.apiUser}/${environment.api.chat.services.messages}/${messageId}`;
    return this._service.promise(this._data.metodoDelete(url));
  }

  deleteAttachment(attachmentId: number) {
    const url = `${this.apiUser}/${environment.api.chat.services.attachments}/${attachmentId}`;
    return this._service.promise(this._data.metodoDelete(url));
  }

  broadcastTyping(conversationId: number, isTyping: boolean) {
    const url = `${this.apiUser}/${environment.api.chat.services.typing}`;
    const data = {
      conversation_id: conversationId,
      is_typing: isTyping
    };
    return this._service.promise(this._data.metodoPost(url, data));
  }

  getConversationUser(id: number) {
    const url = `${this.apiUser}/${environment.api.chat.services.conversations}/${id}/${environment.api.chat.services.users}`;
    return this._service.promise(this._data.metodoGet(url));
  }

  // State management
  setActiveConversation(id: number | null) {
    this.activeConversation$.next(id);
  }

  getActiveConversation(): Observable<number | null> {
    return this.activeConversation$.asObservable();
  }

  updateConversations(conversations: Conversation[]) {
    this.conversations$.next(conversations);
  }

  getConversationsStream(): Observable<Conversation[]> {
    return this.conversations$.asObservable();
  }
}
