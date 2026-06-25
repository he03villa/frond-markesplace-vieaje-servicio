import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { DeleteAccountModalComponent } from './delete-account-modal.component';
import { AuthService } from 'src/app/services/auth.service';
import { ServiceService } from 'src/app/services/service.service';

describe('DeleteAccountModalComponent', () => {
  let component: DeleteAccountModalComponent;
  let fixture: ComponentFixture<DeleteAccountModalComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['deleteAccount']);
    const serviceServiceSpy = jasmine.createSpyObj('ServiceService', ['formValidate', 'presentToast', 'presentLoading', 'Alert', 'addLoading', 'removeLoading']);

    TestBed.configureTestingModule({
      imports: [DeleteAccountModalComponent, FormsModule],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ServiceService, useValue: serviceServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteAccountModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial state', () => {
    expect(component.step).toBe('confirm');
    expect(component.isConfirming).toBeFalse();
    expect(component.password).toBe('');
    expect(component.passwordValid).toBeFalse();
    expect(component.passwordError).toBeFalse();
    expect(component.checkboxes.data).toBeFalse();
    expect(component.checkboxes.services).toBeFalse();
  });

  it('canDelete returns false when password empty or checkboxes not checked', () => {
    expect(component.canDelete).toBeFalse();
    component.password = 'mypassword';
    expect(component.canDelete).toBeFalse();
    component.checkboxes.data = true;
    expect(component.canDelete).toBeFalse();
    component.checkboxes.services = true;
    expect(component.canDelete).toBeTrue();
  });

  it('validatePassword resets error and sets valid when password length > 0', () => {
    component.password = 'abc';
    component.passwordError = true;
    component.validatePassword();
    expect(component.passwordError).toBeFalse();
    expect(component.passwordValid).toBeTrue();
  });

  it('validatePassword sets valid false when password is empty', () => {
    component.password = '';
    component.validatePassword();
    expect(component.passwordValid).toBeFalse();
  });

  it('toggleCheckbox toggles checkbox values', () => {
    expect(component.checkboxes.data).toBeFalse();
    component.toggleCheckbox('data');
    expect(component.checkboxes.data).toBeTrue();
    component.toggleCheckbox('data');
    expect(component.checkboxes.data).toBeFalse();

    component.toggleCheckbox('services');
    expect(component.checkboxes.services).toBeTrue();
  });

  it('deleteAccount does nothing when canDelete is false', async () => {
    await component.deleteAccount();
    expect(authServiceSpy.deleteAccount).not.toHaveBeenCalled();
  });

  it('deleteAccount calls authService.deleteAccount on valid state', async () => {
    component.password = 'mypassword';
    component.checkboxes.data = true;
    component.checkboxes.services = true;
    authServiceSpy.deleteAccount.and.returnValue(Promise.resolve({ success: true }));

    await component.deleteAccount();
    expect(component.isConfirming).toBeTrue();
    expect(component.step).toBe('deleting');
    expect(authServiceSpy.deleteAccount).toHaveBeenCalledWith({ password: 'mypassword' });
  });

  it('deleteAccount sets step to confirm and error on failure', async () => {
    component.password = 'mypassword';
    component.checkboxes.data = true;
    component.checkboxes.services = true;
    authServiceSpy.deleteAccount.and.returnValue(Promise.reject({ error: 'fail' }));

    await component.deleteAccount();
    expect(component.step).toBe('confirm');
    expect(component.passwordError).toBeTrue();
    expect(component.isConfirming).toBeFalse();
  });

  it('onOverlayClick dismisses when target equals currentTarget', () => {
    spyOn(component, 'dismiss');
    const event = { target: 'element', currentTarget: 'element' } as unknown as MouseEvent;
    component.onOverlayClick(event);
    expect(component.dismiss).toHaveBeenCalled();
  });

  it('onOverlayClick does not dismiss when target differs from currentTarget', () => {
    spyOn(component, 'dismiss');
    const event = { target: 'child', currentTarget: 'parent' } as unknown as MouseEvent;
    component.onOverlayClick(event);
    expect(component.dismiss).not.toHaveBeenCalled();
  });

  it('dismiss calls modalCtrl.dismiss', () => {
    component.dismiss();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith();
  });

  it('finish calls modalCtrl.dismiss with deleted: true', () => {
    component.finish();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({ deleted: true });
  });
});
