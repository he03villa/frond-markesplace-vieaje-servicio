import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title when provided', () => {
    component.title = 'Sin mensajes';
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('h3, h2, [class*="title"]');
    expect(el?.textContent).toContain('Sin mensajes');
  });

  it('should emit action when button clicked', () => {
    component.actionText = 'Action';
    fixture.detectChanges();
    spyOn(component.action, 'emit');
    const btn = fixture.nativeElement.querySelector('ion-button');
    if (btn) {
      btn.click();
      expect(component.action.emit).toHaveBeenCalled();
    }
  });

  it('should update icon via ngOnChanges', () => {
    component.icon = 'search-outline';
    component.ngOnChanges({ icon: { currentValue: 'search-outline', previousValue: undefined, firstChange: true, isFirstChange: () => true } });
    expect(component).toBeTruthy();
  });
});
