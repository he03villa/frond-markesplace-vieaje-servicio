import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageUploadSectionComponent } from './image-upload-section.component';

describe('ImageUploadSectionComponent', () => {
  let component: ImageUploadSectionComponent;
  let fixture: ComponentFixture<ImageUploadSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageUploadSectionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageUploadSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit imagesSelected on valid file selection', () => {
    spyOn(component.imagesSelected, 'emit');
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file], value: 'path' } };
    component.onFileSelected(event);
    expect(component.imagesSelected.emit).toHaveBeenCalledWith([file]);
  });

  it('should reject non-image files', () => {
    spyOn(component.imagesSelected, 'emit');
    const file = new File([''], 'test.txt', { type: 'text/plain' });
    const event = { target: { files: [file], value: 'path' } };
    component.onFileSelected(event);
    expect(component.imagesSelected.emit).not.toHaveBeenCalled();
  });

  it('should reject oversized files', () => {
    spyOn(component.imagesSelected, 'emit');
    const content = new Uint8Array(3 * 1024 * 1024);
    const file = new File([content], 'large.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file], value: 'path' } };
    component.onFileSelected(event);
    expect(component.imagesSelected.emit).not.toHaveBeenCalled();
  });

  it('should emit imageRemoved on remove', () => {
    spyOn(component.imageRemoved, 'emit');
    const event = new MouseEvent('click');
    component.onRemove(0, event);
    expect(component.imageRemoved.emit).toHaveBeenCalledWith(0);
  });
});
