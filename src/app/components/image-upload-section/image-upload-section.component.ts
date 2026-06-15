import { DecimalPipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonIcon, IonButton } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { cameraOutline, checkmarkCircleOutline, imagesOutline, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'image-upload-section',
  templateUrl: './image-upload-section.component.html',
  styleUrls: ['./image-upload-section.component.scss'],
  standalone: true,
  imports: [IonIcon, IonButton, DecimalPipe],
})
export class ImageUploadSectionComponent  implements OnInit {

  @Input() previewImages: any[] = [];
  @Output() imagesSelected = new EventEmitter<File[]>();
  @Output() imageRemoved = new EventEmitter<number>();
  @Output() imageLoaded = new EventEmitter<{event: any, index: number}>();
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor() { 
    addIcons({ imagesOutline, cameraOutline, checkmarkCircleOutline, trashOutline });
  }

  ngOnInit() {}

  onFileSelected(event: any): void {
    const files: File[] = Array.from(event.target.files);
    const validFiles: File[] = [];
    
    // Validar cada archivo
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        this.showFileError('La imagen no debe superar los 2MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        this.showFileError('Solo se permiten archivos de imagen');
        return;
      }
      
      validFiles.push(file);
    });
    
    if (validFiles.length > 0) {
      this.imagesSelected.emit(validFiles);
    }
    
    // Resetear input
    event.target.value = '';
  }

  onRemove(index: number, event: Event): void {
    event.stopPropagation();
    this.imageRemoved.emit(index);
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  private showFileError(message: string): void {
    // Puedes implementar un toast o alerta aquí
    console.error(message);
    // Ejemplo con alerta:
    // this.alertController.create({ message, buttons: ['OK'] });
  }

  onImageLoad(event: any, index: number) {
    // Emitir al componente padre si es necesario
    this.imageLoaded.emit({ event, index });
    
    // O procesar directamente aquí
    const img = event.target;
    console.log(`Imagen ${index + 1} cargada: ${img.naturalWidth}x${img.naturalHeight}`);
  }

}
