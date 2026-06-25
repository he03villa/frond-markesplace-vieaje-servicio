import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReviewsPage } from './reviews.page';
import { ServiceService } from 'src/app/services/service.service';
import { AuthService } from 'src/app/services/auth.service';
import { ReviewsService } from 'src/app/services/reviews.service';
import { ModalController } from '@ionic/angular/standalone';

describe('ReviewsPage', () => {
  let component: ReviewsPage;
  let fixture: ComponentFixture<ReviewsPage>;
  let serviceSpy: jasmine.SpyObj<ServiceService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let reviewsSpy: jasmine.SpyObj<ReviewsService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  const mockReviewsResponse = {
    success: true,
    data: {
      data: [{ id: '1', rating: 5, comment: 'Great!', liked: false, likes: 0, helpful: 0 }],
      meta: { has_more_pages: false, current_page: 1 },
      stats: { total_reviews: 1, profile_rating: 4.5, rating_breakdown: [{ stars: 5, percentage: 80, count: 1 }, { stars: 4, percentage: 0, count: 0 }, { stars: 3, percentage: 0, count: 0 }, { stars: 2, percentage: 0, count: 0 }, { stars: 1, percentage: 0, count: 0 }] }
    }
  };

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ServiceService', ['url', 'Toast', 'openModal']);
    authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'getReviews']);
    reviewsSpy = jasmine.createSpyObj('ReviewsService', ['saveLike', 'saveHelpful']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);

    authSpy.getCurrentUser.and.returnValue({ id: 1, name: 'Test' });
    authSpy.getReviews.and.resolveTo(mockReviewsResponse);
    reviewsSpy.saveLike.and.resolveTo({ success: true, data: { liked: true, likes_count: 5 } });
    reviewsSpy.saveHelpful.and.resolveTo({ success: true, data: { helpful_count: 3 } });

    await TestBed.configureTestingModule({
      imports: [ReviewsPage],
      providers: [
        { provide: ServiceService, useValue: serviceSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ReviewsService, useValue: reviewsSpy },
        { provide: ModalController, useValue: modalCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load reviews on init', fakeAsync(() => {
    component.loadReviews();
    tick();
    expect(authSpy.getReviews).toHaveBeenCalledWith(1, { page: 1, filter: 'all', sort: 'recent' });
    expect(component.reviews.length).toBe(1);
    expect(component.isLoading).toBe(false);
  }));

  it('should navigate back', () => {
    component.back();
    expect(serviceSpy.url).toHaveBeenCalledWith('/home');
  });

  it('should set filter and reload', () => {
    spyOn(component, 'loadReviews');
    component.setFilter('5');
    expect(component.activeFilter).toBe('5');
    expect(component.loadReviews).toHaveBeenCalledWith(true);
  });

  it('should set sort and reload', () => {
    spyOn(component, 'loadReviews');
    component.setSort('highest');
    expect(component.sortBy).toBe('highest');
    expect(component.loadReviews).toHaveBeenCalledWith(true);
  });

  it('should toggle like on review', fakeAsync(() => {
    const review = { id: '1', liked: false, likes: 0 } as any;
    component.toggleLike(review);
    tick();
    expect(reviewsSpy.saveLike).toHaveBeenCalledWith(1);
    expect(review.liked).toBe(true);
    expect(review.likes).toBe(5);
  }));

  it('should mark review as helpful', fakeAsync(() => {
    const review = { id: '1', helpful: 0 } as any;
    component.markHelpful(review);
    tick();
    expect(reviewsSpy.saveHelpful).toHaveBeenCalledWith(1);
    expect(review.helpful).toBe(3);
  }));

  it('should open and close image modal', () => {
    const image = { url: 'test.jpg' } as any;
    component.openImage(image);
    expect(component.selectedImage).toBe(image);
    expect(component.showImageModal).toBe(true);

    component.closeImageModal();
    expect(component.showImageModal).toBe(false);
    expect(component.selectedImage).toBeNull();
  });

  it('should getStarArray return correct stars', () => {
    expect(component.getStarArray(4.5)).toEqual(['full', 'full', 'full', 'full', 'half']);
    expect(component.getStarArray(0)).toEqual(['empty', 'empty', 'empty', 'empty', 'empty']);
  });

  it('should getRatingColor return correct color', () => {
    expect(component.getRatingColor(5)).toBe('#10b981');
    expect(component.getRatingColor(4.2)).toBe('#f59e0b');
    expect(component.getRatingColor(3.5)).toBe('#f97316');
    expect(component.getRatingColor(2)).toBe('#ef4444');
  });

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
});
