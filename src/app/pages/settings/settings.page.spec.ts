import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SettingsPage } from './settings.page';
import { ServiceService } from 'src/app/services/service.service';
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';
import { AppVersionService } from 'src/app/services/app-version.service';
import { ModalController } from '@ionic/angular/standalone';

describe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;
  let serviceSpy: jasmine.SpyObj<ServiceService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let themeSpy: jasmine.SpyObj<ThemeService>;
  let appVersionSpy: jasmine.SpyObj<AppVersionService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ServiceService', ['url', 'presentLoading', 'openModal', 'Toast', 'logout', 'Alert']);
    authSpy = jasmine.createSpyObj('AuthService', ['getProfile', 'logout', 'emitUser', 'updateHasNotification', 'sendVerifyEmail']);
    themeSpy = jasmine.createSpyObj('ThemeService', ['isDark', 'toggleTheme']);
    appVersionSpy = jasmine.createSpyObj('AppVersionService', ['getAppInfo']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);

    authSpy.getProfile.and.resolveTo({
      success: true,
      data: { name: 'Test', email: 'test@test.com', phone: '123', avatar: '', verified: true, member_since: '2024', title: '', bio: '', location: '', rating: 5, total_earned: 100, total_trips: 10, has_notification: true }
    });
    appVersionSpy.getAppInfo.and.resolveTo({ version: '2.4.1', build: '892', platform: 'web' });

    await TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [
        { provide: ServiceService, useValue: serviceSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ThemeService, useValue: themeSpy },
        { provide: AppVersionService, useValue: appVersionSpy },
        { provide: ModalController, useValue: modalCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile on init', fakeAsync(() => {
    component.simulateLoad();
    tick();
    expect(authSpy.getProfile).toHaveBeenCalled();
    expect(component.userProfile.name).toBe('Test');
    expect(component.isLoading).toBe(false);
  }));

  it('should navigate back', () => {
    component.back();
    expect(serviceSpy.url).toHaveBeenCalledWith('/home');
  });

  it('should toggle dark mode', () => {
    const initial = component.darkMode;
    component.toggleDarkMode();
    expect(component.darkMode).toBe(!initial);
    expect(themeSpy.toggleTheme).toHaveBeenCalled();
  });

  it('should toggle notifications and call service', fakeAsync(() => {
    authSpy.updateHasNotification.and.resolveTo({ success: true });
    component.notifications = false;
    component.toggleNotifications();
    tick();
    expect(authSpy.updateHasNotification).toHaveBeenCalledWith({ has_notification: true });
  }));

  it('should call logout and clear session', fakeAsync(() => {
    serviceSpy.presentLoading.and.resolveTo({ present: () => Promise.resolve(), dismiss: () => Promise.resolve(true) } as any);
    authSpy.logout.and.resolveTo({ success: true });
    component.logout();
    tick();
    expect(authSpy.logout).toHaveBeenCalled();
    expect(authSpy.emitUser).toHaveBeenCalledWith(null);
    expect(serviceSpy.logout).toHaveBeenCalled();
  }));

  it('should open edit modal', fakeAsync(() => {
    serviceSpy.openModal.and.resolveTo({ data: { editName: 'Test', editTitle: '', editBio: '', tempAvatar: '', editLocation: '', editPhone: '' } });
    component.openEditModal();
    tick();
    expect(serviceSpy.openModal).toHaveBeenCalled();
  }));

  it('should open password modal', () => {
    component.openPasswordModal();
    expect(serviceSpy.openModal).toHaveBeenCalled();
  });

  it('should send verification email', fakeAsync(() => {
    serviceSpy.presentLoading.and.resolveTo({ present: () => Promise.resolve(), dismiss: () => Promise.resolve(true) } as any);
    authSpy.sendVerifyEmail.and.resolveTo({ success: true });
    component.sendVerificationEmail();
    tick();
    expect(authSpy.sendVerifyEmail).toHaveBeenCalled();
  }));

  it('should update headerSolid on scroll', () => {
    component.onScroll({ detail: { scrollTop: 100 } });
    expect(component.headerSolid).toBe(true);
    component.onScroll({ detail: { scrollTop: 30 } });
    expect(component.headerSolid).toBe(false);
  });

  it('should handle refresh', fakeAsync(() => {
    const ev = jasmine.createSpyObj('ev', ['target']);
    ev.target = jasmine.createSpyObj('target', ['complete']);
    component.handleRefresh(ev);
    tick(700);
    expect(ev.target.complete).toHaveBeenCalled();
  }));
});
