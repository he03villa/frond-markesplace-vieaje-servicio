import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonRefresher, IonRefresherContent, IonSkeletonText, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline, arrowBackOutline, arrowDown, arrowUpOutline, cameraOutline, caretBack, chatbubbleOutline, checkmarkCircle, chevronDownOutline, closeOutline, filterOutline, flagOutline, heart, heartOutline, imageOutline, optionsOutline, personOutline, searchOutline, shareOutline, star, starHalf, starOutline, thumbsUpOutline, timeOutline, trophyOutline } from 'ionicons/icons';
import { ServiceService } from 'src/app/services/service.service';
import { RatingBreakdown } from 'src/app/interface/rating-breakdown';
import { Review } from 'src/app/interface/review';
import { ReviewImage } from 'src/app/interface/review-image';
import { AuthService } from 'src/app/services/auth.service';
import { ReviewsService } from 'src/app/services/reviews.service';
import { ModalReporteReviweComponent } from 'src/app/components/modal-reporte-reviwe/modal-reporte-reviwe.component';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.page.html',
  styleUrls: ['./reviews.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonButton, IonIcon, IonRefresher, IonRefresherContent, IonSkeletonText, IonInfiniteScroll, IonInfiniteScrollContent]
})
export class ReviewsPage implements OnInit {

  private _service: ServiceService = inject(ServiceService);
  private _authService: AuthService = inject(AuthService);
  private _reviewsService: ReviewsService = inject(ReviewsService);

  // Header dinámico
  headerSolid = false;
  currentUser = this._authService.getCurrentUser();

  // Filtros
  activeFilter: 'all' | '5' | '4' | '3' | '2' | '1' | 'with-images' | 'with-reply' = 'all';
  sortBy: 'recent' | 'helpful' | 'highest' | 'lowest' = 'recent';

  // Estado
  isLoading = true;
  hasMorePages = true;
  currentPage = 1;

  // Rating del perfil (del padre)
  profileRating = 0;
  totalReviews = 0;
  ratingBreakdown: RatingBreakdown[] = [
    { stars: 5, percentage: 0, count: 0 },
    { stars: 4, percentage: 0, count: 0 },
    { stars: 3, percentage: 0, count: 0 },
    { stars: 2, percentage: 0, count: 0 },
    { stars: 1, percentage: 0, count: 0 }
  ];

  // Reviews
  reviews: Review[] = [];

  // Modal imagen
  selectedImage: ReviewImage | null = null;
  showImageModal = false;

  // Filtros rápidos
  filterChips = [
    { id: 'all', label: 'Todas', count: 124 },
    { id: '5', label: '5 estrellas', count: 89 },
    { id: '4', label: '4 estrellas', count: 22 },
    { id: 'with-images', label: 'Con fotos', count: 34 },
    { id: 'with-reply', label: 'Con respuesta', count: 18 }
  ];

  constructor() {
    addIcons({
      star, starHalf, starOutline, thumbsUpOutline, chatbubbleOutline,
      flagOutline, checkmarkCircle, cameraOutline, closeOutline,
      filterOutline, arrowUpOutline, personOutline, timeOutline,
      imageOutline, chevronDownOutline, heartOutline, shareOutline,
      alertCircleOutline, searchOutline, optionsOutline, trophyOutline, arrowDown, heart, arrowBackOutline
    });
  }

  ngOnInit() {
    this.loadReviews();
  }

  onScroll(ev: any) {
    this.headerSolid = ev.detail.scrollTop > 100;
  }

  scrollToTop() {
    document.querySelector('ion-content')?.scrollToTop(500);
  }

  back(): void {
    history.back();
  }

  // ============ CARGA ============

  async loadReviews(reset = true) {
    if (reset) {
      this.isLoading = true;
      this.currentPage = 1;
      this.reviews = [];
    }

    try {
      const data = {
        page: this.currentPage,
        filter: this.activeFilter,
        sort: this.sortBy
      }
      const res = await this._authService.getReviews(this.currentUser.id, data);
      console.log(res);
      if (res.success) {
        this.reviews = reset ? res.data.data : [...this.reviews, ...res.data.data];
        this.hasMorePages = res.data.meta.has_more_pages;
        this.currentPage = res.data.meta.current_page;
        this.totalReviews = res.data.stats.total_reviews;
        this.profileRating = res.data.stats.profile_rating;
        this.ratingBreakdown = res.data.stats.rating_breakdown;
      }
    } catch (error) {
      console.error(error);
    }

    this.isLoading = false;
  }

  async handleRefresh(ev: any) {
    await this.loadReviews(true);
    ev.target.complete();
  }

  async loadMore(ev: any) {
    this.currentPage++;
    await this.loadReviews(false);
    ev.target.complete();
    if (!this.hasMorePages) ev.target.disabled = true;
  }

  // ============ ACCIONES ============

  setFilter(filter: string) {
    this.activeFilter = filter as any;
    this.loadReviews(true);
  }

  setSort(sort: string) {
    this.sortBy = sort as any;
    this.loadReviews(true);
  }

  async toggleLike(review: Review) {
    try {
      const res = await this._reviewsService.saveLike(parseInt(review.id));
      if (res.success) {
        review.liked = res.data.liked;
        review.likes = res.data.likes_count;
        if (review.liked) {
          await this.showToast('Te gustó esta reseña', 'success');
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  async markHelpful(review: Review) {
    try {
      const res = await this._reviewsService.saveHelpful(parseInt(review.id));
      if (res.success) {
        review.helpful = res.data.helpful_count;
        await this.showToast('Gracias por tu opinión', 'success');
      }
    } catch (error) {
      console.log(error);
    }
  }

  openImage(image: ReviewImage) {
    this.selectedImage = image;
    this.showImageModal = true;
  }

  closeImageModal() {
    this.showImageModal = false;
    this.selectedImage = null;
  }

  async reportReview(review: Review) {
    try {
      //const res = await this._reviewsService.saveReport(parseInt(review.id));
      const res:any = await this._service.openModal(ModalReporteReviweComponent, { review });
      console.log(res);
      /* if (res?.success) {
        await this.showToast('Reseña reportada. La revisaremos.', 'warning');
      } */
    } catch (error) {
      console.log(error);
    }
  }

  // ============ HELPERS ============

  getStarArray(rating: number): ('full' | 'half' | 'empty')[] {
    const stars: ('full' | 'half' | 'empty')[] = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) stars.push('full');
      else if (rating >= i - 0.5) stars.push('half');
      else stars.push('empty');
    }
    return stars;
  }

  getRatingColor(rating: number): string {
    if (rating >= 4.5) return '#10b981';
    if (rating >= 4) return '#f59e0b';
    if (rating >= 3) return '#f97316';
    return '#ef4444';
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this._service.Toast({
      message, duration: 2000, position: 'bottom', color,
      buttons: [{ icon: 'close-outline', role: 'cancel' }]
    });
  }

}
