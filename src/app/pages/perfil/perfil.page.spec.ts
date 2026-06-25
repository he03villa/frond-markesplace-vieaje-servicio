import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PerfilPage } from './perfil.page';
import { ServiceService } from 'src/app/services/service.service';
import { AuthService } from 'src/app/services/auth.service';
import { ModalController } from '@ionic/angular/standalone';

describe('PerfilPage', () => {
  let component: PerfilPage;
  let fixture: ComponentFixture<PerfilPage>;
  let serviceSpy: jasmine.SpyObj<ServiceService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ServiceService', ['url', 'openModal', 'Toast']);
    authSpy = jasmine.createSpyObj('AuthService', ['getProfile']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);

    authSpy.getProfile.and.resolveTo({
      success: true,
      data: { name: 'Test User', email: 'test@test.com', phone: '123', avatar: '', verified: true, member_since: '2024-01', response_time: '1h', completion_rate: 98, stats: [], skills: [], verifications: [], activities: [], menu_items: [], rating: 4.5, title: 'Developer', bio: 'Bio', location: 'City' }
    });

    await TestBed.configureTestingModule({
      imports: [PerfilPage],
      providers: [
        { provide: ServiceService, useValue: serviceSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ModalController, useValue: modalCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilPage);
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
    expect(component.profile?.name).toBe('Test User');
    expect(component.isLoading).toBe(false);
  }));

  it('should navigate back', () => {
    component.back();
    expect(serviceSpy.url).toHaveBeenCalledWith('/home');
  });

  it('should navigate to route', () => {
    component.navigate('/my-services');
    expect(serviceSpy.url).toHaveBeenCalledWith('/home/my-services');
  });

  it('should open edit modal and update profile', fakeAsync(() => {
    component.profile = { name: 'Old', title: '', bio: '', avatar: '', location: '', phone: '', email: '', verified: true, rating: 0 } as any;
    serviceSpy.openModal.and.resolveTo({ data: { editName: 'New Name', editTitle: 'New Title', editBio: 'New Bio', tempAvatar: 'new.jpg', editLocation: 'New Loc', editPhone: '555' } });
    component.openEditModal();
    tick();
    expect(serviceSpy.openModal).toHaveBeenCalled();
    expect(component.profile?.name).toBe('New Name');
    expect(component.profile?.title).toBe('New Title');
  }));

  it('should update headerSolid on scroll', () => {
    component.onScroll({ detail: { scrollTop: 150 } });
    expect(component.headerSolid).toBe(true);
    component.onScroll({ detail: { scrollTop: 50 } });
    expect(component.headerSolid).toBe(false);
  });

  it('should handle refresh', fakeAsync(() => {
    const ev = jasmine.createSpyObj('ev', ['target']);
    ev.target = jasmine.createSpyObj('target', ['complete']);
    component.handleRefresh(ev);
    tick();
    expect(ev.target.complete).toHaveBeenCalled();
  }));

  it('should getStarArray return correct stars for rating', () => {
    expect(component.getStarArray(4.5)).toEqual(['full', 'full', 'full', 'full', 'half']);
    expect(component.getStarArray(0)).toEqual(['empty', 'empty', 'empty', 'empty', 'empty']);
    expect(component.getStarArray(5)).toEqual(['full', 'full', 'full', 'full', 'full']);
  });

  it('should getSkillStyle return color based on index', () => {
    const style = component.getSkillStyle(0);
    expect(style.background).toBeDefined();
    expect(style.color).toBeDefined();
    expect(style.borderColor).toBeDefined();
  });

  it('should share profile show toast', fakeAsync(() => {
    component.shareProfile();
    tick();
    expect(serviceSpy.Toast).toHaveBeenCalled();
  }));
});
