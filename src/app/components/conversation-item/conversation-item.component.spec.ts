import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConversationItemComponent } from './conversation-item.component';
import { ServiceService } from 'src/app/services/service.service';

describe('ConversationItemComponent', () => {
  let component: ConversationItemComponent;
  let fixture: ComponentFixture<ConversationItemComponent>;

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('ServiceService', ['errorImage']);
    await TestBed.configureTestingModule({
      imports: [ConversationItemComponent],
      providers: [
        { provide: ServiceService, useValue: serviceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConversationItemComponent);
    component = fixture.componentInstance;
    component.conversation = { contact: { name: 'Test', avatar: '' } };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show contact name', () => {
    component.conversation = { contact: { name: 'María', avatar: 'avatar.svg' }, unread_count: 0 };
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('María');
  });

  it('should indicate online status', () => {
    component.conversation = { contact: { name: 'Test', avatar: '', online: true }, unread_count: 0 };
    expect(component.contactOnline).toBeTrue();
  });

  it('should detect own message', () => {
    component.conversation = { contact: { name: 'Test' }, last_message: { is_mine: true } };
    expect(component.lastMessageIsMine).toBeTrue();
  });
});
