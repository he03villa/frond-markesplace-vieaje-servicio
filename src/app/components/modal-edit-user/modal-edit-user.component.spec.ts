import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { ModalEditUserComponent } from './modal-edit-user.component';
import { AuthService } from 'src/app/services/auth.service';
import { ServiceService } from 'src/app/services/service.service';

describe('ModalEditUserComponent', () => {
  let component: ModalEditUserComponent;
  let fixture: ComponentFixture<ModalEditUserComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockData = {
    editName: 'Juan',
    editTitle: 'Developer',
    editBio: 'Bio text',
    tempAvatar: 'avatar.jpg',
    editLocation: 'City',
    editPhone: '123456789'
  };

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['saveAvatar', 'updateProfile']);
    const serviceServiceSpy = jasmine.createSpyObj('ServiceService', ['formValidate', 'presentToast', 'presentLoading', 'Alert', 'addLoading', 'removeLoading']);

    TestBed.configureTestingModule({
      imports: [ModalEditUserComponent, FormsModule],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ServiceService, useValue: serviceServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalEditUserComponent);
    component = fixture.componentInstance;
    component.data = { ...mockData };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize fields from data on ngOnInit', () => {
    expect(component.editName).toBe('Juan');
    expect(component.editTitle).toBe('Developer');
    expect(component.editBio).toBe('Bio text');
    expect(component.tempAvatar).toBe('avatar.jpg');
    expect(component.editLocation).toBe('City');
    expect(component.editPhone).toBe('123456789');
  });

  it('selectPresetAvatar sets tempAvatar and clears selectedFile', () => {
    component.selectedFile = new File([''], 'test.png');
    component.selectPresetAvatar('new-avatar.jpg');
    expect(component.tempAvatar).toBe('new-avatar.jpg');
    expect(component.selectedFile).toBeNull();
  });

  it('saveProfile calls authService.updateProfile and dismisses on success', async () => {
    authServiceSpy.updateProfile.and.returnValue(Promise.resolve({
      success: true,
      data: { name: 'Juan Updated', title: 'Developer', bio: 'Bio text', location: 'City', phone: '123456789' }
    }));
    component.editName = 'Juan Updated';

    await component.saveProfile();
    expect(authServiceSpy.updateProfile).toHaveBeenCalledWith({ name: 'Juan Updated' });
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(component.data);
  });

  it('saveProfile handles error gracefully', async () => {
    authServiceSpy.updateProfile.and.returnValue(Promise.reject(new Error('fail')));
    await component.saveProfile();
    expect(modalCtrlSpy.dismiss).not.toHaveBeenCalled();
  });

  it('saveProfile does not send unchanged fields', async () => {
    authServiceSpy.updateProfile.and.returnValue(Promise.resolve({
      success: true,
      data: { name: 'Juan', title: 'Developer', bio: 'Bio text', location: 'City', phone: '123456789' }
    }));

    await component.saveProfile();
    expect(authServiceSpy.updateProfile).toHaveBeenCalledWith({});
  });

  it('salir calls modalCtrl.dismiss with data', () => {
    component.salir({ key: 'value' });
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({ key: 'value' });
  });

  it('salir calls modalCtrl.dismiss with undefined by default', () => {
    component.salir();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(undefined);
  });
});
