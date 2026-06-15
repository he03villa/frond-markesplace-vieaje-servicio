import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import Swiper from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonButton]
})
export class OnboardingPage implements OnInit {

  @ViewChild('swiperContainer', { static: false }) swiperContainer?: ElementRef;
  private swiper?: Swiper;

  constructor(private router: Router) {}
  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.initSwiper();
  }

  private initSwiper() {
    if (this.swiperContainer) {
      console.log(this.swiperContainer);
      this.swiper = new Swiper(this.swiperContainer.nativeElement, {
        // Opciones de configuración
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
        scrollbar: {
          el: '.swiper-scrollbar',
        },
      });
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

}
