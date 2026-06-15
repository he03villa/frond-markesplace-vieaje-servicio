import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatConversationPage } from './chat-conversation.page';

describe('ChatConversationPage', () => {
  let component: ChatConversationPage;
  let fixture: ComponentFixture<ChatConversationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatConversationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
