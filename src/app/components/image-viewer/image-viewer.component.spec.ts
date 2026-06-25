import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageViewerComponent } from './image-viewer.component';
import { ModalController } from '@ionic/angular/standalone';

describe('ImageViewerComponent', () => {
  let component: ImageViewerComponent;
  let fixture: ComponentFixture<ImageViewerComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  beforeEach(async () => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    await TestBed.configureTestingModule({
      imports: [ImageViewerComponent],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageViewerComponent);
    component = fixture.componentInstance;
    component.images = ['img1.jpg', 'img2.jpg'];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with given index', () => {
    component.initialIndex = 1;
    component.ngOnInit();
    expect(component.currentIndex).toBe(1);
  });

  it('should navigate forward', () => {
    component.currentIndex = 0;
    component.next();
    expect(component.currentIndex).toBe(1);
  });

  it('should not navigate beyond last image', () => {
    component.currentIndex = 1;
    component.next();
    expect(component.currentIndex).toBe(1);
  });

  it('should navigate backward', () => {
    component.currentIndex = 1;
    component.prev();
    expect(component.currentIndex).toBe(0);
  });

  it('should not navigate before first image', () => {
    component.currentIndex = 0;
    component.prev();
    expect(component.currentIndex).toBe(0);
  });

  it('should dismiss modal', () => {
    component.dismiss();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
  });
});
