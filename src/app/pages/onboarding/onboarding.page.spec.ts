import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OnboardingPage } from './onboarding.page';
import { ServiceService } from 'src/app/services/service.service';

describe('OnboardingPage', () => {
  let component: OnboardingPage;
  let fixture: ComponentFixture<OnboardingPage>;
  let serviceSpy: jasmine.SpyObj<ServiceService>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ServiceService', ['url']);

    await TestBed.configureTestingModule({
      imports: [OnboardingPage],
      providers: [
        { provide: ServiceService, useValue: serviceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set initial slide to 0', () => {
    expect(component.currentSlide).toBe(0);
  });

  it('should set total slides to 3', () => {
    expect(component.totalSlides).toBe(3);
  });

  it('should mark seen_onboarding and navigate to login on goToLogin', () => {
    spyOn(localStorage, 'setItem');
    component.goToLogin();
    expect(localStorage.setItem).toHaveBeenCalledWith('seen_onboarding', 'true');
    expect(serviceSpy.url).toHaveBeenCalledWith('/login');
  });

  it('should mark seen_onboarding and navigate to login on skip', () => {
    spyOn(localStorage, 'setItem');
    component.skip();
    expect(localStorage.setItem).toHaveBeenCalledWith('seen_onboarding', 'true');
    expect(serviceSpy.url).toHaveBeenCalledWith('/login');
  });

  it('should advance to next slide when not on last slide', () => {
    component.currentSlide = 0;
    const swiperSpy = jasmine.createSpyObj('Swiper', ['slideNext']);
    (component as any).swiper = swiperSpy;
    component.next();
    expect(swiperSpy.slideNext).toHaveBeenCalled();
  });

  it('should go to login when next is called on last slide', () => {
    spyOn(component, 'goToLogin');
    component.currentSlide = 2;
    component.next();
    expect(component.goToLogin).toHaveBeenCalled();
  });

  it('should call slideNext when on slide 1', () => {
    component.currentSlide = 1;
    spyOn(component, 'goToLogin');
    const swiperSpy = jasmine.createSpyObj('Swiper', ['slideNext']);
    (component as any).swiper = swiperSpy;
    component.next();
    expect(swiperSpy.slideNext).toHaveBeenCalled();
    expect(component.goToLogin).not.toHaveBeenCalled();
  });

  it('should mark completed and set localStorage', () => {
    spyOn(localStorage, 'setItem');
    (component as any).markCompleted();
    expect(localStorage.setItem).toHaveBeenCalledWith('seen_onboarding', 'true');
  });
});
