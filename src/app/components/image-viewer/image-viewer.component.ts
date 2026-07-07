import { Component, inject, Input, OnInit } from '@angular/core';
import { ModalController, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, chevronBack, chevronForward, close, remove } from 'ionicons/icons';
import { ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss'],
  standalone: true,
  imports: [IonContent, IonIcon]
})
export class ImageViewerComponent implements OnInit {

  _service: ServiceService = inject(ServiceService);

  @Input() images: string[] = [];
  @Input() initialIndex = 0;

  private modalCtrl: ModalController = inject(ModalController);

  currentIndex = 0;
  scale = 1;
  isDragging = false;
  startX = 0;
  translateX = 0;

  constructor() { 
    addIcons({ close, chevronBack, chevronForward, add, remove });
  }

  ngOnInit() { 
    this.currentIndex = this.initialIndex;
  }

  dismiss(): void {
    this.modalCtrl.dismiss();
  }

  next(): void {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
      this.resetZoom();
    }
  }

  prev(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.resetZoom();
    }
  }

  resetZoom(): void {
    this.scale = 1;
    this.translateX = 0;
  }

  zoomIn(): void {
    if (this.scale < 3) this.scale += 0.5;
  }

  zoomOut(): void {
    if (this.scale > 1) this.scale -= 0.5;
  }

  onTouchStart(e: TouchEvent): void {
    this.isDragging = true;
    this.startX = e.touches[0].clientX;
  }

  onTouchMove(e: TouchEvent): void {
    if (!this.isDragging) return;
    const diff = e.touches[0].clientX - this.startX;
    this.translateX = diff;
  }

  onTouchEnd(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    if (this.translateX > 80 && this.currentIndex > 0) {
      this.prev();
    } else if (this.translateX < -80 && this.currentIndex < this.images.length - 1) {
      this.next();
    }
    this.translateX = 0;
  }

}
