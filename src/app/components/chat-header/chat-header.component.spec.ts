import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatHeaderComponent } from './chat-header.component';
import { ServiceService } from 'src/app/services/service.service';

describe('ChatHeaderComponent', () => {
  let component: ChatHeaderComponent;
  let fixture: ComponentFixture<ChatHeaderComponent>;

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('ServiceService', ['errorImage']);
    await TestBed.configureTestingModule({
      imports: [ChatHeaderComponent],
      providers: [
        { provide: ServiceService, useValue: serviceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatHeaderComponent);
    component = fixture.componentInstance;
    component.contact = { name: 'Test', avatar: '' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit back event', () => {
    spyOn(component.back, 'emit');
    component.onBack();
    expect(component.back.emit).toHaveBeenCalled();
  });

  it('should emit profile event', () => {
    spyOn(component.profile, 'emit');
    component.onProfile();
    expect(component.profile.emit).toHaveBeenCalled();
  });
});
