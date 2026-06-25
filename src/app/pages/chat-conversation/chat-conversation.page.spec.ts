import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ChatConversationPage } from './chat-conversation.page';
import { ChatService } from 'src/app/services/chat.service';
import { ChatSocketService } from 'src/app/services/chat-socket.service';
import { AuthService } from 'src/app/services/auth.service';
import { ServiceService } from 'src/app/services/service.service';
import { ModalController } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ChatConversationPage', () => {
  let component: ChatConversationPage;
  let fixture: ComponentFixture<ChatConversationPage>;
  let chatServiceSpy: jasmine.SpyObj<ChatService>;
  let socketSpy: jasmine.SpyObj<ChatSocketService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let serviceSpy: jasmine.SpyObj<ServiceService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  const mockConversation = { id: 1, name: 'Test', contact: { id: 2, name: 'Contact' } };

  beforeEach(async () => {
    chatServiceSpy = jasmine.createSpyObj('ChatService', [
      'getConversation', 'getMessages', 'markAsRead', 'sendMessage', 'broadcastTyping', 'getConversationUser'
    ]);
    socketSpy = jasmine.createSpyObj('ChatSocketService', ['isConnected', 'connect', 'leaveChannel', 'listenToConversation']);
    authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    serviceSpy = jasmine.createSpyObj('ServiceService', ['url']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);

    authSpy.getCurrentUser.and.returnValue({ id: 1, name: 'Me' });
    chatServiceSpy.getConversation.and.resolveTo({ success: true, data: mockConversation });
    chatServiceSpy.getMessages.and.resolveTo({ success: true, data: [{ id: 1, body: 'Hello', sender_id: 2, conversation_id: 1, created_at: new Date().toISOString() }] });
    chatServiceSpy.markAsRead.and.resolveTo({ success: true });
    socketSpy.isConnected.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [ChatConversationPage],
      providers: [
        { provide: ChatService, useValue: chatServiceSpy },
        { provide: ChatSocketService, useValue: socketSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ServiceService, useValue: serviceSpy },
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: ActivatedRoute, useValue: { paramMap: of({ get: (key: string) => key === 'id' ? '1' : null }) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatConversationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load conversation on init with id param', fakeAsync(() => {
    component.loadConversation();
    tick();
    expect(chatServiceSpy.getConversation).toHaveBeenCalledWith(1);
    expect(chatServiceSpy.getMessages).toHaveBeenCalledWith(1);
    expect(chatServiceSpy.markAsRead).toHaveBeenCalledWith(1);
    expect(component.conversation).toEqual(mockConversation);
  }));

  it('should load conversation by user', fakeAsync(() => {
    (component as any).conversationId = 2;
    chatServiceSpy.getConversationUser.and.resolveTo({ success: true, data: { id: 3, name: 'User Chat', contact: { id: 4 } } });
    chatServiceSpy.getMessages.and.resolveTo({ success: true, data: [{ id: 10, body: 'Hi', sender_id: 4 }] });
    component.loadConversationUser();
    tick();
    expect(chatServiceSpy.getConversationUser).toHaveBeenCalledWith(2);
    expect((component as any).conversationId).toBe(3);
  }));

  it('should navigate back', () => {
    component.goBack();
    expect(serviceSpy.url).toHaveBeenCalledWith('/home/messages');
  });

  it('should open profile', () => {
    component.conversation = { contact: { id: 5 } };
    component.openProfile();
    expect(serviceSpy.url).toHaveBeenCalledWith('/chat/profile/5');
  });

  it('should send message', fakeAsync(() => {
    component.conversation = { contact: { id: 2 } };
    chatServiceSpy.sendMessage.and.resolveTo({ success: true, data: { message: { id: 99, body: 'Hi', sender_id: 1 } } });
    component.sendMessage({ text: 'Hi', files: undefined });
    tick();
    expect(chatServiceSpy.sendMessage).toHaveBeenCalledWith(2, 'Hi', undefined);
  }));

  it('should broadcast typing', fakeAsync(() => {
    (component as any).conversationId = 1;
    component.broadcastTyping(true);
    tick();
    expect(chatServiceSpy.broadcastTyping).toHaveBeenCalled();
  }));

  it('should determine first in group correctly', () => {
    component.messages = [
      { id: 1, sender_id: 2 },
      { id: 2, sender_id: 2 },
      { id: 3, sender_id: 3 }
    ];
    expect(component.isFirstInGroup(component.messages[0], 0)).toBe(true);
    expect(component.isFirstInGroup(component.messages[1], 1)).toBe(false);
    expect(component.isFirstInGroup(component.messages[2], 2)).toBe(true);
  });

  it('should determine last in group correctly', () => {
    component.messages = [
      { id: 1, sender_id: 2 },
      { id: 2, sender_id: 2 },
      { id: 3, sender_id: 3 }
    ];
    expect(component.isLastInGroup(component.messages[0], 0)).toBe(false);
    expect(component.isLastInGroup(component.messages[1], 1)).toBe(true);
    expect(component.isLastInGroup(component.messages[2], 2)).toBe(true);
  });

  it('should format date divider', () => {
    const today = new Date().toISOString();
    expect(component.formatDateDivider(today)).toBe('Hoy');

    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(component.formatDateDivider(yesterday)).toBe('Ayer');
  });

  it('should handle attachment', fakeAsync(() => {
    spyOn(component, 'sendMessage');
    component.handleAttachment([new File([''], 'test.pdf')]);
    expect(component.sendMessage).toHaveBeenCalledWith({ text: '', files: [jasmine.any(File)] });
  }));
});
