import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessagesPage } from './messages.page';
import { ServiceService } from 'src/app/services/service.service';

describe('MessagesPage', () => {
  let component: MessagesPage;
  let fixture: ComponentFixture<MessagesPage>;
  let serviceSpy: jasmine.SpyObj<ServiceService>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ServiceService', ['url']);

    await TestBed.configureTestingModule({
      imports: [MessagesPage],
      providers: [
        { provide: ServiceService, useValue: serviceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MessagesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default chat data', () => {
    expect(component.chatData).toBeDefined();
    expect(component.chatData.chats.length).toBe(5);
    expect(component.chatData.currentUser.name).toBe('Juan Pérez');
  });

  it('should open a chat and set currentChatId', () => {
    component.openChat(1);
    expect(component.currentChatId).toBe(1);
    expect(component.chatData.chat.userName).toBe('María González');
  });

  it('should return to chat list on backToChats', () => {
    component.currentChatId = 1;
    component.backToChats();
    expect(component.currentChatId).toBeNull();
  });

  it('should initialize with no active chat', () => {
    expect(component.currentChatId).toBeNull();
  });
});
