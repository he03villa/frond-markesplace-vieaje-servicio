import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatProfilePage } from './chat-profile.page';

describe('ChatProfilePage', () => {
  let component: ChatProfilePage;
  let fixture: ComponentFixture<ChatProfilePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatProfilePage]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
