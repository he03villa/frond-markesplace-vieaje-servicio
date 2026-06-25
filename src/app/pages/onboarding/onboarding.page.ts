import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { ServiceService } from 'src/app/services/service.service';
import Swiper from 'swiper';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton]
})
export class OnboardingPage implements AfterViewInit {

  @ViewChild('swiperContainer', { static: false }) swiperContainer?: ElementRef;
  private swiper?: Swiper;
  private _service: ServiceService = inject(ServiceService);
  currentSlide = 0;
  readonly totalSlides = 3;

  ngAfterViewInit() {
    this.initSwiper();
  }

  private initSwiper() {
    if (this.swiperContainer) {
      this.swiper = new Swiper(this.swiperContainer.nativeElement, {
        direction: 'horizontal',
        loop: false,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        on: {
          slideChange: () => {
            this.currentSlide = this.swiper?.activeIndex ?? 0;
          },
        },
      });
    }
  }

  private markCompleted() {
    localStorage.setItem('seen_onboarding', 'true');
  }

  goToLogin() {
    this.markCompleted();
    this._service.url('/login');
  }

  skip() {
    this.markCompleted();
    this._service.url('/login');
  }

  next() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.swiper?.slideNext();
    } else {
      this.goToLogin();
    }
  }

}
