import { Component, inject, Input, OnDestroy } from '@angular/core';
import { addIcons } from 'ionicons';
import { checkmark, checkmarkDone, documentOutline, pauseCircle, playCircle } from 'ionicons/icons';
import { IonIcon } from "@ionic/angular/standalone";
import { ServiceService } from 'src/app/services/service.service';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';

@Component({
  selector: 'app-message-bubble',
  templateUrl: './message-bubble.component.html',
  styleUrls: ['./message-bubble.component.scss'],
  standalone: true,
  imports: [IonIcon]
})
export class MessageBubbleComponent implements OnDestroy {

  @Input() message: any;
  @Input() isFirstInGroup: boolean = false;
  @Input() isLastInGroup: boolean = false;

  _service: ServiceService = inject(ServiceService);

  audioPlayers = new Map<string, HTMLAudioElement>();
  audioStates = new Map<string, { playing: boolean; progress: number; currentTime: number; duration: number }>();

  constructor() {
    addIcons({
      playCircle, documentOutline, checkmark, checkmarkDone, pauseCircle
    });
  }

  ngOnDestroy() {
    // Limpiar todos los audios al destruir
    this.audioPlayers.forEach(audio => audio.pause());
    this.audioPlayers.clear();
  }

  /**
   * Abre un modal/preview del adjunto (imagen, audio, archivo)
   */
  async previewAttachment(att: any, allAttachments: any[]): Promise<void> {
    if (att.type === 'image') {
      const images = allAttachments
        .filter(a => a.type === 'image')
        .map(a => a.url);
      const initialIndex = images.indexOf(att.url);

      this._service.openModal(ImageViewerComponent, { images, initialIndex }, { cssClass: 'modal-fullscreen' });

    } else if (att.type === 'file' || att.type === 'document') {
      window.open(att.url, '_blank');
    }
  }

  /**
   * Formatea segundos a mm:ss
   */
  formatDuration(seconds: number | undefined | null): string {
    if (!seconds || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Formatea la hora del mensaje (14:30)
   */
  /* formatTime(isoString: string | undefined | null): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('es', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } */

  getAudioState(att: any) {
    if (!this.audioStates.has(att.url)) {
      this.audioStates.set(att.url, { playing: false, progress: 0, currentTime: 0, duration: att.duration_seconds || 0 });
    }
    return this.audioStates.get(att.url)!;
  }

  toggleAudio(att: any): void {
    if (!this.audioPlayers.has(att.url)) {
      const audio = new Audio(att.url);
      const state = this.getAudioState(att);

      audio.onloadedmetadata = () => {
        state.duration = audio.duration;
      };
      audio.ontimeupdate = () => {
        state.currentTime = audio.currentTime;
        state.progress = state.duration > 0 ? (audio.currentTime / state.duration) * 100 : 0;
      };
      audio.onended = () => {
        state.playing = false;
        state.progress = 0;
        state.currentTime = 0;
        audio.currentTime = 0;
      };

      this.audioPlayers.set(att.url, audio);
    }

    const audio = this.audioPlayers.get(att.url)!;
    const state = this.getAudioState(att);

    // Pausar cualquier otro audio que esté sonando
    this.audioPlayers.forEach((a, url) => {
      if (url !== att.url && !a.paused) {
        a.pause();
        this.audioStates.get(url)!.playing = false;
      }
    });

    if (state.playing) {
      audio.pause();
    } else {
      audio.play();
    }
    state.playing = !state.playing;
  }

  seekAudio(att: any, event: Event): void {
    const audio = this.audioPlayers.get(att.url);
    const state = this.getAudioState(att);
    if (!audio) return;
    const value = +(event.target as HTMLInputElement).value;
    audio.currentTime = (value / 100) * state.duration;
  }

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

}
