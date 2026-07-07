import { Component, ElementRef, EventEmitter, inject, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { addIcons } from 'ionicons';
import { add, addCircle, cameraOutline, checkmarkCircle, checkmarkCircleOutline, closeCircle, documentOutline, documentTextOutline, happyOutline, imageOutline, mic, micOutline, musicalNotesOutline, send, stop, trashOutline } from 'ionicons/icons';
import { IonIcon, IonButton } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { SelectedFile } from 'src/app/interface/selected-file';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Capacitor } from '@capacitor/core';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { VoiceRecorder, RecordingData } from 'capacitor-voice-recorder';
import { ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.scss'],
  standalone: true,
  imports: [IonIcon, FormsModule]
})
export class MessageInputComponent implements OnInit, OnDestroy {

  @ViewChild('messageInput', { static: false }) messageInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('fileInputRef', { static: false }) fileInputRef!: ElementRef<HTMLInputElement>;

  messageText: string = '';
  _service: ServiceService = inject(ServiceService);
  attachMenuOpen: boolean = false;
  selectedFiles: SelectedFile[] = [];
  isRecording = false;
  recordingSeconds = 0;
  audioPreview: { file: File; url: string; duration: number } | null = null;
  audioWaveHeights: number[] = [];
  recordingStartY: number = 0;
  recordingCancelled: boolean = false;

  private blobUrls: string[] = [];
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  private isNative = Capacitor.isNativePlatform();
  private typingSubject = new Subject<boolean>();
  private destroy$ = new Subject<void>();
  private recordingTimer: any = null;
  private mediaRecorder: MediaRecorder | null = null;  // solo web
  private audioChunks: Blob[] = [];
  private pointerDownTime = 0;
  private readonly HOLD_THRESHOLD_MS = 300; // ms para distinguir tap vs hold
  private holdTimer: any = null;

  @Output() send = new EventEmitter<{ text: string; files?: File[] }>();
  @Output() typing = new EventEmitter<boolean>();
  @Output() attach = new EventEmitter<File[]>();

  get hasContent(): boolean {
    return this.messageText.trim().length > 0 || this.selectedFiles.length > 0;
  }

  get sendIcon(): string {
    if (this.hasContent) return 'send';
    if (this.isRecording) return 'stop';
    return 'mic';
  }

  constructor() {
    addIcons({
      addCircle, imageOutline, cameraOutline, documentOutline, micOutline, checkmarkCircleOutline,
      closeCircle, happyOutline, send, mic, musicalNotesOutline, documentTextOutline, stop, trashOutline,
      add, checkmarkCircle
    });
  }

  ngOnInit() {
    this.typingSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil
        (this.destroy$)
    ).subscribe(isTyping => {
      this.typing.emit(isTyping);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.blobUrls.forEach(url => URL.revokeObjectURL(url));
    if (this.recordingTimer) clearInterval(this.recordingTimer);
  }

  onInput() {
    this.typingSubject.next(this.messageText.length > 0);
    this.autoResize();
  }

  handleEnter(event: Event): void {
    event.preventDefault();
    this.triggerSend();
  }

  autoResize(): void {
    const textarea = this.messageInput?.nativeElement;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
  }

  toggleEmoji(): void {
    this.messageText += '😊';
    this.onInput();
  }

  onSend() {
    if (!this.messageText.trim()) return;
    this.send.emit({ text: this.messageText });
    this.messageText = '';
    this.typing.emit(false);
  }

  onAttach(files: File[]) {
    this.attach.emit(files);
  }

  toggleAttachMenu(): void {
    this.attachMenuOpen = !this.attachMenuOpen;
  }

  async selectImage(): Promise<void> {
    this.attachMenuOpen = false;
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        quality: 80,
      });

      if (photo.webPath) {
        const file = await this.uriToFile(photo.webPath, 'imagen.jpg', 'image/jpeg');
        this.addFile(file);
      }
    } catch (err) {
      console.error('selectImage error:', err);
    }
  }

  async takePhoto(): Promise<void> {
    this.attachMenuOpen = false;
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 80,
      });

      if (photo.webPath) {
        const file = await this.uriToFile(photo.webPath, 'foto.jpg', 'image/jpeg');
        this.addFile(file);
      }
    } catch (err) {
      console.error('takePhoto error:', err);
    }
  }

  async selectFile(): Promise<void> {
    this.attachMenuOpen = false;

    if (this.isNative) {
      await this.selectFileNative();
    } else {
      this.selectFileWeb();  // input nativo del browser
    }
  }

  recordAudio(): void {
    this.attachMenuOpen = false;
    this.startRecording();
  }

  private async addFile(file: File): Promise<void> {
    const cleanFile = await this.stripHttpHeaders(file);

    const blobUrl = URL.createObjectURL(cleanFile);
    this.blobUrls.push(blobUrl);

    const preview: SafeUrl | null = cleanFile.type.startsWith('image/')
      ? this.sanitizer.bypassSecurityTrustUrl(blobUrl)
      : null;

    this.selectedFiles.push({
      file: cleanFile,
      type: cleanFile.type,
      preview,
      original_name: cleanFile.name,
      human_size: this.formatSize(cleanFile.size),
    });

    this.typing.emit(true);
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    if (this.selectedFiles.length === 0 && !this.messageText.trim()) {
      this.typing.emit(false);
    }
  }

  triggerSend(): void {
    const text = this.messageText.trim();

    if (!text && this.selectedFiles.length === 0) {
      this.startRecording();
      return;
    }

    // Emitir archivos File reales al componente padre
    this.send.emit({
      text,
      files: this.selectedFiles.length > 0
        ? this.selectedFiles.map(sf => sf.file)
        : undefined,
    });

    this.reset();
  }

  private reset(): void {
    this.messageText = '';
    this.selectedFiles = [];
    this.attachMenuOpen = false;
    this.typingSubject.next(false);
    this.typing.emit(false);
    this.audioWaveHeights = [];
    const textarea = this.messageInput?.nativeElement;
    if (textarea) textarea.style.height = 'auto';
  }

  async startRecording(): Promise<void> {
    console.log('Iniciar grabación de audio...');
    try {
      if (this.isNative) {
        await this.startRecordingNative();
      } else {
        await this.startRecordingWeb();
      }
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
      this.isRecording = true;
      this.recordingSeconds = 0;
      this.recordingTimer = setInterval(() => this.recordingSeconds++, 1000);
    } catch (err) {
      console.error('startRecording error:', err);
    }
  }

  private async uriToFile(webPath: string, name: string, mimeType: string): Promise<File> {
    const response = await fetch(webPath);
    const blob = await response.blob();
    return new File([blob], name, { type: mimeType });
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // Icono para archivos no-imagen en el preview
  iconForFile(sf: SelectedFile): string {
    if (sf.type.startsWith('audio/')) return 'musical-notes-outline';
    if (sf.type === 'application/pdf') return 'document-text-outline';
    return 'document-outline';
  }

  private async selectFileNative(): Promise<void> {
    try {
      const result = await FilePicker.pickFiles({ readData: true });
      for (const picked of result.files) {
        if (!picked.data) continue;
        const bytes = Uint8Array.from(atob(picked.data), c => c.charCodeAt(0));
        const file = new File([bytes], picked.name, { type: picked.mimeType });
        this.addFile(file);
      }
    } catch (err) {
      console.error('selectFileNative error:', err);
    }
  }

  private selectFileWeb(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt,image/*,audio/*';

    input.onchange = (event: Event) => {
      console.log('selectFileWeb', event);
      const files = (event.target as HTMLInputElement).files;
      if (!files) return;
      Array.from(files).forEach(file => this.addFile(file));
    };

    input.click();
  }

  private async stripHttpHeaders(file: File): Promise<File> {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Verificar si empieza con "HTTP/"  (48 54 54 50 2f)
    const startsWithHttp =
      bytes[0] === 0x48 && bytes[1] === 0x54 &&
      bytes[2] === 0x54 && bytes[3] === 0x50 &&
      bytes[4] === 0x2f;

    if (!startsWithHttp) return file; // archivo limpio, no tocar

    // Buscar el doble CRLF (\r\n\r\n) que separa headers del body
    const separator = this.findDoubleCRLF(bytes);
    if (separator === -1) return file; // no encontrado, devolver tal cual

    const cleanBytes = bytes.slice(separator);
    const cleanBlob = new Blob([cleanBytes], { type: file.type });
    return new File([cleanBlob], file.name, { type: file.type });
  }

  private findDoubleCRLF(bytes: Uint8Array): number {
    for (let i = 0; i < bytes.length - 3; i++) {
      if (
        bytes[i] === 0x0d && bytes[i + 1] === 0x0a &&  // \r\n
        bytes[i + 2] === 0x0d && bytes[i + 3] === 0x0a     // \r\n
      ) {
        return i + 4; // retorna el inicio del body
      }
    }
    return -1;
  }

  async stopRecording(): Promise<void> {
    clearInterval(this.recordingTimer);
    this.recordingTimer = null;
    this.isRecording = false;

    try {
      const file = this.isNative
        ? await this.stopRecordingNative()
        : await this.stopRecordingWeb();

      if (!file) return;

      const url = URL.createObjectURL(file);
      this.blobUrls.push(url);
      this.audioPreview = { file, url, duration: this.recordingSeconds };
      this.audioWaveHeights = Array.from({ length: 10 }, () => Math.random() * 20 + 8);
      console.log('audioPreview', this.audioPreview);
    } catch (err) {
      console.error('stopRecording error:', err);
    }
  }

  async cancelRecording(): Promise<void> {
    clearInterval(this.recordingTimer);
    this.recordingTimer = null;
    this.isRecording = false;
    this.recordingSeconds = 0;
    this.audioWaveHeights = [];

    if (this.isNative) {
      await VoiceRecorder.stopRecording().catch(() => { });
    } else {
      this.mediaRecorder?.stop();
      this.mediaRecorder = null;
      this.audioChunks = [];
    }
  }

  discardAudio(): void {
    this.audioPreview = null;
    this.recordingSeconds = 0;
    this.audioWaveHeights = [];
  }

  confirmAudio(): void {
    if (!this.audioPreview) return;
    this.selectedFiles.push({
      file: this.audioPreview.file,
      type: 'audio/webm',
      preview: null,
      original_name: `nota_de_voz_${Date.now()}.webm`,
      human_size: this.formatSize(this.audioPreview.file.size),
    });
    this.audioPreview = null;
    this.audioWaveHeights = [];
    this.typing.emit(true);
  }

  private async startRecordingNative(): Promise<void> {
    const permission = await VoiceRecorder.requestAudioRecordingPermission();
    if (!permission.value) throw new Error('Permiso denegado');
    await VoiceRecorder.startRecording();
  }

  private async stopRecordingNative(): Promise<File | null> {
    const result: RecordingData = await VoiceRecorder.stopRecording();
    if (!result.value?.recordDataBase64) return null;

    const bytes = Uint8Array.from(atob(result.value.recordDataBase64), c => c.charCodeAt(0));
    return new File([bytes], `nota_de_voz_${Date.now()}.aac`, { type: 'audio/aac' });
    /* return null; */
  }

  private async startRecordingWeb(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioChunks = [];
    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.audioChunks.push(e.data);
    };
    this.mediaRecorder.start();
  }

  private stopRecordingWeb(): Promise<File | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) return resolve(null);

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const file = new File([blob], `nota_de_voz_${Date.now()}.webm`, { type: 'audio/webm' });
        this.mediaRecorder = null;
        this.audioChunks = [];
        resolve(file);
      };

      this.mediaRecorder.stop();
      // Detener el stream del micrófono
      this.mediaRecorder.stream.getTracks().forEach(t => t.stop());
    });
  }

  formatRecordingTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  onMicPointerDown(event: PointerEvent): void {
    event.preventDefault(); // evita que dispare click después

    const hasContent = this.messageText.trim().length > 0 || this.selectedFiles.length > 0;
    if (hasContent) {
      // Si hay texto o archivos → enviar directo
      this.triggerSend();
      return;
    }

    this.pointerDownTime = Date.now();

    // Iniciar grabación solo si mantiene presionado más de 300ms
    this.holdTimer = setTimeout(() => {
      this.startRecording();
    }, this.HOLD_THRESHOLD_MS);
  }

  onMicPointerUp(event: PointerEvent): void {
    event.preventDefault();

    const holdDuration = Date.now() - this.pointerDownTime;

    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }

    if (this.isRecording) {
      // Estaba grabando → detener
      this.stopRecording();
    }
    // Si fue tap rápido (< 300ms) y no hay contenido → no hacer nada
    // (el holdTimer fue cancelado antes de iniciar grabación)
  }

  onMicPointerLeave(event: PointerEvent): void {
    event.preventDefault();

    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }

    if (this.isRecording) {
      this.cancelRecording();
    }
  }

  getRandomHeight(): number {
    return (Math.random() * 20 + 8);
  }

}
