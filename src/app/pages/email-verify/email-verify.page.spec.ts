import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailVerifyPage } from './email-verify.page';
import { ServiceService } from 'src/app/services/service.service';
import { ActivatedRoute } from '@angular/router';

describe('EmailVerifyPage', () => {
  let component: EmailVerifyPage;
  let fixture: ComponentFixture<EmailVerifyPage>;
  let serviceSpy: jasmine.SpyObj<ServiceService>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ServiceService', ['url']);

    await TestBed.configureTestingModule({
      imports: [EmailVerifyPage],
      providers: [
        { provide: ServiceService, useValue: serviceSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => 'success' } } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmailVerifyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have loading as initial status', () => {
    expect(component.currentStatus).toBe('loading');
  });

  it('should navigate to route via service', () => {
    component.navigate('/login');
    expect(serviceSpy.url).toHaveBeenCalledWith('/login');
  });

  it('should retry and reset status to loading', () => {
    component.currentStatus = 'error';
    component.retry();
    expect(component.currentStatus).toBe('loading');
  });

  it('should trigger animation toggle', () => {
    component.isAnimating = true;
    component.triggerAnimation();
    expect(component.isAnimating).toBe(false);
  });

  it('should return state object based on currentStatus', () => {
    component.currentStatus = 'success';
    expect(component.state.title).toBe('¡Email verificado!');
    component.currentStatus = 'invalid';
    expect(component.state.title).toBe('Enlace inválido');
    component.currentStatus = 'error';
    expect(component.state.title).toBe('Algo salió mal');
  });

  it('should not navigate when route is empty', () => {
    component.navigate('');
    expect(serviceSpy.url).not.toHaveBeenCalled();
  });
});
