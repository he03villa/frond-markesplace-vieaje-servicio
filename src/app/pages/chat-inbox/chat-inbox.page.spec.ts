import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ChatInboxPage } from './chat-inbox.page';
import { ChatService } from 'src/app/services/chat.service';
import { ServiceService } from 'src/app/services/service.service';
import { ModalController } from '@ionic/angular/standalone';

describe('ChatInboxPage', () => {
  let component: ChatInboxPage;
  let fixture: ComponentFixture<ChatInboxPage>;
  let chatSpy: jasmine.SpyObj<ChatService>;
  let serviceSpy: jasmine.SpyObj<ServiceService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  beforeEach(async () => {
    chatSpy = jasmine.createSpyObj('ChatService', ['getConversations']);
    serviceSpy = jasmine.createSpyObj('ServiceService', ['url']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);

    chatSpy.getConversations.and.resolveTo({ success: true, data: [{ id: 1, name: 'Test Conversation' }] });

    await TestBed.configureTestingModule({
      imports: [ChatInboxPage],
      providers: [
        { provide: ChatService, useValue: chatSpy },
        { provide: ServiceService, useValue: serviceSpy },
        { provide: ModalController, useValue: modalCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatInboxPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load conversations on init', fakeAsync(() => {
    component.getAllConversations();
    tick();
    expect(chatSpy.getConversations).toHaveBeenCalled();
    expect(component.conversations.length).toBe(1);
  }));

  it('should open conversation and navigate', () => {
    const conversation = { id: 5 };
    component.openConversation(conversation);
    expect(serviceSpy.url).toHaveBeenCalledWith('/home/5/chat-conversation');
  });
});
