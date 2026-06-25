import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MessageInputComponent } from './message-input.component';

describe('MessageInputComponent', () => {
  let component: MessageInputComponent;
  let fixture: ComponentFixture<MessageInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageInputComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MessageInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return false for hasContent when empty', () => {
    component.messageText = '';
    component.selectedFiles = [];
    expect(component.hasContent).toBeFalse();
  });

  it('should return true for hasContent when text exists', () => {
    component.messageText = 'Hola';
    expect(component.hasContent).toBeTrue();
  });

  it('should return true for hasContent when files selected', () => {
    component.messageText = '';
    component.selectedFiles = [{ file: new File([], 'test.pdf'), type: 'application/pdf', preview: null, original_name: 'test.pdf', human_size: '1 KB' }];
    expect(component.hasContent).toBeTrue();
  });

  it('should return send icon when has content', () => {
    component.messageText = 'text';
    expect(component.sendIcon).toBe('send');
  });

  it('should return mic icon when empty and not recording', () => {
    component.messageText = '';
    component.isRecording = false;
    expect(component.sendIcon).toBe('mic');
  });

  it('should return stop icon when recording', () => {
    component.messageText = '';
    component.isRecording = true;
    expect(component.sendIcon).toBe('stop');
  });

  it('should emit send event with text on send', () => {
    spyOn(component.send, 'emit');
    component.messageText = 'Hola mundo';
    component.onSend();
    expect(component.send.emit).toHaveBeenCalledWith({ text: 'Hola mundo' });
    expect(component.messageText).toBe('');
  });

  it('should not emit send when messageText is only whitespace', () => {
    spyOn(component.send, 'emit');
    component.messageText = '   ';
    component.onSend();
    expect(component.send.emit).not.toHaveBeenCalled();
  });

  it('should emit typing event on input', fakeAsync(() => {
    spyOn(component.typing, 'emit');
    component.messageText = 'Hola';
    component.onInput();
    tick(600);
    expect(component.typing.emit).toHaveBeenCalledWith(true);
  }));

  it('should emit typing false when message becomes empty', fakeAsync(() => {
    spyOn(component.typing, 'emit');
    component.messageText = '';
    component.onInput();
    tick(600);
    expect(component.typing.emit).toHaveBeenCalledWith(false);
  }));

  it('should handle enter key and call triggerSend', () => {
    spyOn(component, 'triggerSend');
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    spyOn(event, 'preventDefault');
    component.handleEnter(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.triggerSend).toHaveBeenCalled();
  });

  it('should toggle emoji into messageText', () => {
    component.messageText = 'Hola';
    component.toggleEmoji();
    expect(component.messageText).toBe('Hola😊');
  });

  it('should toggle attach menu', () => {
    expect(component.attachMenuOpen).toBeFalse();
    component.toggleAttachMenu();
    expect(component.attachMenuOpen).toBeTrue();
    component.toggleAttachMenu();
    expect(component.attachMenuOpen).toBeFalse();
  });

  it('should emit attach event', () => {
    spyOn(component.attach, 'emit');
    const files = [new File([''], 'test.pdf')];
    component.onAttach(files);
    expect(component.attach.emit).toHaveBeenCalledWith(files);
  });

  it('should remove file from selectedFiles', () => {
    component.selectedFiles = [
      { file: new File([], 'a.pdf'), type: 'application/pdf', preview: null, original_name: 'a.pdf', human_size: '1 KB' },
      { file: new File([], 'b.pdf'), type: 'application/pdf', preview: null, original_name: 'b.pdf', human_size: '2 KB' }
    ];
    component.removeFile(0);
    expect(component.selectedFiles.length).toBe(1);
    expect(component.selectedFiles[0].original_name).toBe('b.pdf');
  });

  it('should trigger send when has content and triggerSend is called', () => {
    spyOn(component.send, 'emit');
    component.messageText = 'Test';
    component.triggerSend();
    expect(component.send.emit).toHaveBeenCalledWith({ text: 'Test', files: undefined });
    expect(component.messageText).toBe('');
  });

  it('should format recording time as mm:ss', () => {
    expect(component.formatRecordingTime(0)).toBe('00:00');
    expect(component.formatRecordingTime(65)).toBe('01:05');
    expect(component.formatRecordingTime(3661)).toBe('61:01');
  });

  it('should format file size correctly', () => {
    expect(component['formatSize'](500)).toBe('500 B');
    expect(component['formatSize'](1500)).toBe('1.5 KB');
    expect(component['formatSize'](1500000)).toBe('1.4 MB');
  });

  it('should return correct icon for file type', () => {
    const audioFile = { type: 'audio/mp3' } as any;
    const pdfFile = { type: 'application/pdf' } as any;
    const genericFile = { type: 'text/plain' } as any;
    expect(component.iconForFile(audioFile)).toBe('musical-notes-outline');
    expect(component.iconForFile(pdfFile)).toBe('document-text-outline');
    expect(component.iconForFile(genericFile)).toBe('document-outline');
  });

  it('should clean up on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');
    component.ngOnDestroy();
    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });

  it('should discard audio preview', () => {
    component.audioPreview = { file: new File([], 'audio.webm'), url: 'blob:test', duration: 10 };
    component.recordingSeconds = 10;
    component.audioWaveHeights = [10, 20, 30];
    component.discardAudio();
    expect(component.audioPreview).toBeNull();
    expect(component.recordingSeconds).toBe(0);
    expect(component.audioWaveHeights).toEqual([]);
  });

  it('should confirm audio and add to selected files', () => {
    component.audioPreview = { file: new File(['audio'], 'test.webm', { type: 'audio/webm' }), url: 'blob:test', duration: 10 };
    component.confirmAudio();
    expect(component.selectedFiles.length).toBe(1);
    expect(component.selectedFiles[0].type).toBe('audio/webm');
    expect(component.audioPreview).toBeNull();
  });
});
