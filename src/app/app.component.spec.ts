import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  function createTabBar(): HTMLElement {
    const el = document.createElement('ion-tab-bar');
    document.body.appendChild(el);
    return el;
  }

  it('should hide tab bar on chat-conversation route', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const mockElement = createTabBar();

    (component as any).toggleTabBar('/home/chat-conversation/123');
    expect(mockElement.classList.contains('d-none')).toBeTrue();

    document.body.removeChild(mockElement);
  });

  it('should hide tab bar on chat-conversation-users route', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const mockElement = createTabBar();

    (component as any).toggleTabBar('/home/5/chat-conversation-users');
    expect(mockElement.classList.contains('d-none')).toBeTrue();

    document.body.removeChild(mockElement);
  });

  it('should hide tab bar on reviews route', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const mockElement = createTabBar();

    (component as any).toggleTabBar('/home/reviews');
    expect(mockElement.classList.contains('d-none')).toBeTrue();

    document.body.removeChild(mockElement);
  });

  it('should hide tab bar on my-services route', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const mockElement = createTabBar();

    (component as any).toggleTabBar('/home/my-services');
    expect(mockElement.classList.contains('d-none')).toBeTrue();

    document.body.removeChild(mockElement);
  });

  it('should hide tab bar on my-rides route', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const mockElement = createTabBar();

    (component as any).toggleTabBar('/home/my-rides');
    expect(mockElement.classList.contains('d-none')).toBeTrue();

    document.body.removeChild(mockElement);
  });

  it('should hide tab bar on stats route', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const mockElement = createTabBar();

    (component as any).toggleTabBar('/home/stats');
    expect(mockElement.classList.contains('d-none')).toBeTrue();

    document.body.removeChild(mockElement);
  });

  it('should hide tab bar on settings route', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const mockElement = createTabBar();

    (component as any).toggleTabBar('/home/settings');
    expect(mockElement.classList.contains('d-none')).toBeTrue();

    document.body.removeChild(mockElement);
  });

  it('should show tab bar on home route', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const mockElement = createTabBar();

    (component as any).toggleTabBar('/home');
    expect(mockElement.classList.contains('d-none')).toBeFalse();

    document.body.removeChild(mockElement);
  });

  it('should show tab bar on search route', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const mockElement = createTabBar();

    (component as any).toggleTabBar('/home/search');
    expect(mockElement.classList.contains('d-none')).toBeFalse();

    document.body.removeChild(mockElement);
  });

  it('should show tab bar on messages route', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const mockElement = createTabBar();

    (component as any).toggleTabBar('/home/messages');
    expect(mockElement.classList.contains('d-none')).toBeFalse();

    document.body.removeChild(mockElement);
  });

  it('should show tab bar on profile route', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const mockElement = createTabBar();

    (component as any).toggleTabBar('/home/profile');
    expect(mockElement.classList.contains('d-none')).toBeFalse();

    document.body.removeChild(mockElement);
  });

  it('should handle when no tab bar element exists', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    expect(() => {
      (component as any).toggleTabBar('/some-route');
    }).not.toThrow();
  });

  it('should unsubscribe on destroy', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    component.ngOnInit();
    const sub = (component as any).routerSubscription;
    expect(sub.closed).toBeFalse();
    component.ngOnDestroy();
    expect(sub.closed).toBeTrue();
  });
});
