import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { ModalCompleteWorkerComponent } from './modal-complete-worker.component';
import { ServiceService } from 'src/app/services/service.service';
import { ServiceRequestsService } from 'src/app/services/service-requests.service';

describe('ModalCompleteWorkerComponent', () => {
  let component: ModalCompleteWorkerComponent;
  let fixture: ComponentFixture<ModalCompleteWorkerComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let serviceServiceSpy: jasmine.SpyObj<ServiceService>;
  let serviceRequestsSpy: jasmine.SpyObj<ServiceRequestsService>;

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    serviceServiceSpy = jasmine.createSpyObj('ServiceService', ['presentLoading', 'presentToast', 'formValidate', 'Alert', 'addLoading', 'removeLoading']);
    serviceRequestsSpy = jasmine.createSpyObj('ServiceRequestsService', ['saveDeliverRequest']);

    const loadingMock = { present: jasmine.createSpy('present').and.returnValue(Promise.resolve()), dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve()) };
    serviceServiceSpy.presentLoading.and.returnValue(Promise.resolve(loadingMock as any));

    TestBed.configureTestingModule({
      imports: [ModalCompleteWorkerComponent, FormsModule],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: ServiceService, useValue: serviceServiceSpy },
        { provide: ServiceRequestsService, useValue: serviceRequestsSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalCompleteWorkerComponent);
    component = fixture.componentInstance;
    component.service = { id: 1, status: 'in_progress' };
    component.acceptedOffer = {};
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('canSubmitCompletion returns false when completionNotes is empty', () => {
    component.completionNotes = '';
    component.evidenceImages = [{ file: new File([''], 'img.png'), preview: 'data:,' }];
    expect(component.canSubmitCompletion).toBeFalse();
  });

  it('canSubmitCompletion returns false when evidenceImages is empty', () => {
    component.completionNotes = 'Completed';
    component.evidenceImages = [];
    expect(component.canSubmitCompletion).toBeFalse();
  });

  it('canSubmitCompletion returns true when both notes and images are present', () => {
    component.completionNotes = 'Completed';
    component.evidenceImages = [{ file: new File([''], 'img.png'), preview: 'data:,' }];
    expect(component.canSubmitCompletion).toBeTrue();
  });

  it('closeCompleteModal calls modalCtrl.dismiss and resets state', () => {
    component.completionNotes = 'test';
    component.actualHours = 5;
    component.evidenceImages = [{ file: new File([''], 'img.png'), preview: 'data:,' }];
    component.evidenceDocs = [{ file: new File([''], 'doc.pdf'), name: 'doc.pdf' }];
    component.closeCompleteModal();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
    expect(component.completionNotes).toBe('');
    expect(component.actualHours).toBeNull();
    expect(component.evidenceImages.length).toBe(0);
    expect(component.evidenceDocs.length).toBe(0);
  });

  it('removeEvidenceImage removes image at index', () => {
    component.evidenceImages = [
      { file: new File([''], 'a.png'), preview: 'data:,' },
      { file: new File([''], 'b.png'), preview: 'data:,' }
    ];
    component.removeEvidenceImage(0);
    expect(component.evidenceImages.length).toBe(1);
    expect(component.evidenceImages[0].file.name).toBe('b.png');
  });

  it('removeEvidenceDoc removes doc at index', () => {
    component.evidenceDocs = [
      { file: new File([''], 'a.pdf'), name: 'a.pdf' },
      { file: new File([''], 'b.pdf'), name: 'b.pdf' }
    ];
    component.removeEvidenceDoc(0);
    expect(component.evidenceDocs.length).toBe(1);
    expect(component.evidenceDocs[0].name).toBe('b.pdf');
  });

  it('submitCompletion does nothing when canSubmitCompletion is false', async () => {
    await component.submitCompletion();
    expect(serviceRequestsSpy.saveDeliverRequest).not.toHaveBeenCalled();
  });

  it('submitCompletion calls saveDeliverRequest on valid state', async () => {
    component.completionNotes = 'Completed work';
    component.evidenceImages = [{ file: new File([''], 'img.png'), preview: 'data:,' }];
    serviceRequestsSpy.saveDeliverRequest.and.returnValue(Promise.resolve({ success: true }));

    await component.submitCompletion();
    expect(serviceRequestsSpy.saveDeliverRequest).toHaveBeenCalledWith(1, jasmine.any(FormData));
    expect(component.service.status).toBe('delivered');
  });

  it('submitCompletion shows error toast on failure', async () => {
    component.completionNotes = 'Completed work';
    component.evidenceImages = [{ file: new File([''], 'img.png'), preview: 'data:,' }];
    serviceRequestsSpy.saveDeliverRequest.and.returnValue(Promise.reject(new Error('fail')));

    await component.submitCompletion();
    expect(component.toastVisible).toBeTrue();
    expect(component.toastType).toBe('error');
  });

  it('onEvidenceImagesSelected validates file size using the showToast fallback', () => {
    const largeFile = new File([''], 'large.jpg');
    Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 });
    const files = [largeFile];
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', {
      value: { length: files.length, item: (i: number) => files[i], 0: files[0] }
    });
    const event = { target: input } as unknown as Event;
    component.onEvidenceImagesSelected(event);
    expect(component.toastVisible).toBeTrue();
    expect(component.toastType).toBe('error');
    expect(component.toastMessage).toContain('5MB');
  });

  it('onEvidenceDocsSelected adds documents', () => {
    const file = new File([''], 'report.pdf');
    const files = [file];
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', {
      value: { length: files.length, item: (i: number) => files[i], 0: files[0] }
    });
    const event = { target: input } as unknown as Event;
    component.onEvidenceDocsSelected(event);
    expect(component.evidenceDocs.length).toBe(1);
    expect(component.evidenceDocs[0].name).toBe('report.pdf');
  });

  it('should show toast on submit failure', async () => {
    component.completionNotes = 'Test';
    component.evidenceImages = [{ file: new File([''], 'img.png'), preview: 'data:,' }];
    serviceRequestsSpy.saveDeliverRequest.and.returnValue(Promise.reject(new Error('fail')));

    await component.submitCompletion();
    expect(component.toastVisible).toBeTrue();
    expect(component.toastType).toBe('error');
  });
});
