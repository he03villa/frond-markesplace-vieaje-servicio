import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorComponent } from './error.component';

describe('ErrorComponent', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorComponent);
    component = fixture.componentInstance;
    component.control = { invalid: false, touched: false, dirty: false, errors: null, hasError: () => false };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display message when provided', () => {
    component.message = 'Campo requerido';
    component.validation = 'required';
    component.control = { invalid: true, touched: true, dirty: true, errors: { required: true }, hasError: (key: string) => key === 'required' };
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.fv-plugins-message-container');
    expect(el?.textContent).toContain('Campo requerido');
  });

  it('should show validation message when control is invalid and touched', () => {
    component.control = { invalid: true, touched: true, dirty: false, errors: { required: true }, hasError: (key: string) => key === 'required' };
    component.validation = 'required';
    component.message = 'Campo requerido';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Campo requerido');
  });
});
