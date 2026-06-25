import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageBubbleComponent } from './message-bubble.component';
import { ServiceService } from 'src/app/services/service.service';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { ModalController } from '@ionic/angular/standalone';

describe('MessageBubbleComponent', () => {
  let component: MessageBubbleComponent;
  let fixture: ComponentFixture<MessageBubbleComponent>;
  let originalAudio: typeof Audio;

  beforeAll(() => {
    originalAudio = window.Audio;
    window.Audio = class MockAudio {
      paused = true;
      pause = jasmine.createSpy('pause').and.callFake(() => { this.paused = true; });
      play = jasmine.createSpy('play').and.callFake(() => { this.paused = false; return Promise.resolve(); });
      currentTime = 0;
      duration = 0;
      onloadedmetadata: (() => void) | null = null;
      ontimeupdate: (() => void) | null = null;
      onended: (() => void) | null = null;
    } as any;
  });

  afterAll(() => {
    window.Audio = originalAudio;
  });

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('ServiceService', ['openModal', 'errorImage']);

    await TestBed.configureTestingModule({
      imports: [MessageBubbleComponent],
      providers: [
        { provide: ServiceService, useValue: serviceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MessageBubbleComponent);
    component = fixture.componentInstance;
    component.message = { text: '', sender: { name: '', avatar: '' }, is_mine: false };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display message text when provided', () => {
    component.message = { text: 'Hola mundo', sender: { name: 'User' } };
    fixture.detectChanges();
    expect(component.message.text).toBe('Hola mundo');
  });

  it('should handle message with attachments', () => {
    component.message = {
      text: 'Mira esto',
      attachments: [{ type: 'image', url: 'img.jpg' }]
    };
    fixture.detectChanges();
    expect(component.message.attachments.length).toBe(1);
  });

  it('should format duration from seconds to mm:ss', () => {
    expect(component.formatDuration(65)).toBe('1:05');
    expect(component.formatDuration(0)).toBe('0:00');
    expect(component.formatDuration(null)).toBe('0:00');
    expect(component.formatDuration(undefined)).toBe('0:00');
    expect(component.formatDuration(3661)).toBe('61:01');
  });

  it('should format time from seconds', () => {
    expect(component.formatTime(65)).toBe('1:05');
    expect(component.formatTime(0)).toBe('0:00');
    expect(component.formatTime(NaN)).toBe('0:00');
    expect(component.formatTime(3600)).toBe('60:00');
  });

  it('should open modal when previewing image attachment', async () => {
    const att = { type: 'image', url: 'img1.jpg' };
    const allAttachments = [
      { type: 'image', url: 'img1.jpg' },
      { type: 'image', url: 'img2.jpg' },
      { type: 'file', url: 'doc.pdf' }
    ];
    await component.previewAttachment(att, allAttachments);
    expect(component._service.openModal).toHaveBeenCalledWith(
      ImageViewerComponent,
      { images: ['img1.jpg', 'img2.jpg'], initialIndex: 0 },
      { cssClass: 'modal-fullscreen' }
    );
  });

  it('should open modal with correct initial index for non-first image', async () => {
    const att = { type: 'image', url: 'img2.jpg' };
    const allAttachments = [
      { type: 'image', url: 'img1.jpg' },
      { type: 'image', url: 'img2.jpg' }
    ];
    await component.previewAttachment(att, allAttachments);
    expect(component._service.openModal).toHaveBeenCalledWith(
      ImageViewerComponent,
      { images: ['img1.jpg', 'img2.jpg'], initialIndex: 1 },
      jasmine.any(Object)
    );
  });

  it('should get audio state and initialize if missing', () => {
    const att = { url: 'audio.mp3', duration_seconds: 30 };
    let state = component.getAudioState(att);
    expect(state.playing).toBeFalse();
    expect(state.progress).toBe(0);
    expect(state.duration).toBe(30);

    state.playing = true;
    state = component.getAudioState(att);
    expect(state.playing).toBeTrue();
  });

  it('should toggle audio on and off', () => {
    const att = { url: 'audio.mp3', duration_seconds: 30 };
    component.toggleAudio(att);
    const state = component.getAudioState(att);
    expect(state.playing).toBeTrue();

    component.toggleAudio(att);
    expect(state.playing).toBeFalse();
  });

  it('should pause other audios when toggling a new one', () => {
    const att1 = { url: 'audio1.mp3', duration_seconds: 30 };
    const att2 = { url: 'audio2.mp3', duration_seconds: 45 };

    component.toggleAudio(att1);
    expect(component.getAudioState(att1).playing).toBeTrue();

    component.toggleAudio(att2);
    expect(component.getAudioState(att1).playing).toBeFalse();
    expect(component.getAudioState(att2).playing).toBeTrue();
  });

  it('should clean up audio players on destroy', () => {
    const pauseSpy = jasmine.createSpy('pause');
    const audioMock = { pause: pauseSpy } as any;
    component.audioPlayers.set('test.mp3', audioMock);
    component.ngOnDestroy();
    expect(pauseSpy).toHaveBeenCalled();
    expect(component.audioPlayers.size).toBe(0);
  });
});
