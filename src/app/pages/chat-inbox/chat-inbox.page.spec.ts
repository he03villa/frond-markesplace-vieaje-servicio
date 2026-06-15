import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatInboxPage } from './chat-inbox.page';

describe('ChatInboxPage', () => {
  let component: ChatInboxPage;
  let fixture: ComponentFixture<ChatInboxPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatInboxPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
