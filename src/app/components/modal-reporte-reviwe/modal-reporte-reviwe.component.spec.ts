import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { ModalReporteReviweComponent } from './modal-reporte-reviwe.component';
import { ReviewsService } from 'src/app/services/reviews.service';
import { Review } from 'src/app/interface/review';

describe('ModalReporteReviweComponent', () => {
  let component: ModalReporteReviweComponent;
  let fixture: ComponentFixture<ModalReporteReviweComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let reviewsServiceSpy: jasmine.SpyObj<ReviewsService>;

  const mockReview: Review = { id: '1', rating: 5, comment: 'Great!', user: null, service_request_id: '1' } as unknown as Review;

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    reviewsServiceSpy = jasmine.createSpyObj('ReviewsService', ['saveReport']);

    TestBed.configureTestingModule({
      imports: [ModalReporteReviweComponent, FormsModule],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: ReviewsService, useValue: reviewsServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalReporteReviweComponent);
    component = fixture.componentInstance;
    component.review = mockReview;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default report reasons', () => {
    expect(component.reportReasons.length).toBe(5);
    expect(component.reportReasons[0].id).toBe('inappropriate');
  });

  it('closeReportModal calls modalCtrl.dismiss with data', () => {
    component.closeReportModal({ key: 'value' });
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({ key: 'value' });
  });

  it('closeReportModal calls modalCtrl.dismiss with undefined by default', () => {
    component.closeReportModal();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(undefined);
  });

  it('selectReportReason sets selectedReason and fills detail from predefined reasons', () => {
    component.selectReportReason('fake');
    expect(component.selectedReportReason).toBe('fake');
    expect(component.reportDetail).toBe('Reseña falsa o engañosa');
  });

  it('selectReportReason clears detail when reason is "other"', () => {
    component.reportDetail = 'some detail';
    component.selectReportReason('other');
    expect(component.selectedReportReason).toBe('other');
    expect(component.reportDetail).toBe('');
  });

  it('canSubmitReport returns false when no reason selected', () => {
    expect(component.canSubmitReport()).toBeFalse();
  });

  it('canSubmitReport returns true when non-other reason is selected', () => {
    component.selectReportReason('spam');
    expect(component.canSubmitReport()).toBeTrue();
  });

  it('canSubmitReport returns false when "other" reason is selected without enough detail', () => {
    component.selectReportReason('other');
    component.reportDetail = 'short';
    expect(component.canSubmitReport()).toBeFalse();
  });

  it('canSubmitReport returns true when "other" reason is selected with 10+ chars', () => {
    component.selectReportReason('other');
    component.reportDetail = '1234567890';
    expect(component.canSubmitReport()).toBeTrue();
  });

  it('submitReport calls reviewsService.saveReport', async () => {
    component.selectReportReason('spam');
    reviewsServiceSpy.saveReport.and.returnValue(Promise.resolve({ success: true }));

    await component.submitReport();
    expect(reviewsServiceSpy.saveReport).toHaveBeenCalledWith(1, { reason: 'Spam o publicidad' });
    expect(component.reportSubmitted).toBeTrue();
  });

  it('submitReport does nothing when canSubmitReport is false', async () => {
    await component.submitReport();
    expect(reviewsServiceSpy.saveReport).not.toHaveBeenCalled();
  });
});
