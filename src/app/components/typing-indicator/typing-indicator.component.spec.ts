import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TypingIndicatorComponent } from './typing-indicator.component';
import { ServiceService } from 'src/app/services/service.service';

describe('TypingIndicatorComponent', () => {
  let component: TypingIndicatorComponent;
  let fixture: ComponentFixture<TypingIndicatorComponent>;

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('ServiceService', ['errorImage']);
    await TestBed.configureTestingModule({
      imports: [TypingIndicatorComponent],
      providers: [
        { provide: ServiceService, useValue: serviceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TypingIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display contact name', () => {
    component.contactName = 'Juan';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Juan');
  });
});
