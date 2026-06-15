import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton,
  IonButtons, IonModal, IonSkeletonText,
  IonRefresher, IonRefresherContent, IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  briefcaseOutline, call, camera, carOutline, checkmarkCircle, checkmarkDone,
  chevronForward, closeOutline, createOutline, helpCircleOutline, mail,
  settingsOutline, shieldCheckmark, star, starHalf, starOutline, time,
  shareOutline, personOutline, locationOutline, cashOutline, calendarOutline,
  trendingUpOutline, colorPaletteOutline, constructOutline, flashOutline,
  waterOutline, pawOutline, leafOutline, schoolOutline, sparklesOutline,
  arrowUpOutline, addOutline, trashOutline, checkmarkOutline,
  arrowDown,
  peopleOutline,
  documentTextOutline,
  arrowBackOutline
} from 'ionicons/icons';
import { UserProfile } from 'src/app/interface/user-profile';
import { ServiceService } from 'src/app/services/service.service';
import { AuthService } from 'src/app/services/auth.service';
import { ModalEditUserComponent } from 'src/app/components/modal-edit-user/modal-edit-user.component';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton,
    IonButtons, IonModal, IonSkeletonText,
    IonRefresher, IonRefresherContent, IonBadge
  ]
})
export class PerfilPage implements OnInit {
  @ViewChild('editModal') editModal!: IonModal;

  private _service = inject(ServiceService);
  private authService = inject(AuthService);

  // Estado UI
  isLoading = true;
  headerSolid = false;
  editName = '';
  editTitle = '';
  editBio = '';
  tempAvatar = '';
  editLocation = '';
  editPhone = '';
  selectedFile: File | null = null;

  // Datos del perfil
  profile: UserProfile | null = null;

  // Skills con colores predefinidos
  skillColors = [
    { bg: 'rgba(99,102,241,0.12)', color: '#6366f1', border: 'rgba(99,102,241,0.25)' },
    { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.25)' },
    { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
    { bg: 'rgba(236,72,153,0.12)', color: '#ec4899', border: 'rgba(236,72,153,0.25)' },
    { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: 'rgba(59,130,246,0.25)' },
    { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6', border: 'rgba(139,92,246,0.25)' }
  ];

  constructor() {
    addIcons({
      briefcaseOutline, call, camera, carOutline, checkmarkCircle, checkmarkDone,
      chevronForward, closeOutline, createOutline, helpCircleOutline, mail,
      settingsOutline, shieldCheckmark, star, starHalf, starOutline, time,
      shareOutline, personOutline, locationOutline, cashOutline, calendarOutline,
      trendingUpOutline, colorPaletteOutline, constructOutline, flashOutline,
      waterOutline, pawOutline, leafOutline, schoolOutline, sparklesOutline,
      arrowUpOutline, addOutline, trashOutline, checkmarkOutline, arrowDown, peopleOutline, documentTextOutline,
      arrowBackOutline
    });
  }

  ngOnInit() {
    this.simulateLoad();
  }

  // ============ SCROLL & HEADER ============

  onScroll(ev: any) {
    const scrollTop = ev.detail.scrollTop;
    this.headerSolid = scrollTop > 120;
  }

  back(): void {
    history.back();
  }

  // ============ CARGA DE DATOS ============

  async simulateLoad() {
    this.isLoading = true;
    try {
      const res = await this.authService.getProfile();
      console.log(res);
      if (res.success) {
        this.profile = res.data;
        if (this.profile) {
          this.profile.menuItems = res.data.menu_items ?? [];
          this.profile.memberSince = res.data.member_since ?? '';
          this.profile.responseTime = res.data.response_time ?? '';
          this.profile.completionRate = res.data.completion_rate ?? 0;
          this.profile.stats = res.data.stats ?? [];
          this.profile.skills = res.data.skills ?? [];
          this.profile.verifications = res.data.verifications ?? [];
          this.profile.activities = res.data.activities ?? [];
        }
      }
    } catch (error) {
      console.log(error);
    }
    setTimeout(() => {
      this.isLoading = false;
    }, 800);
  }

  async handleRefresh(ev: any) {
    await this.simulateLoad();
    ev.target.complete();
  }

  // ============ EDICIÓN ============

  async openEditModal() {
    this.editName = this.profile?.name || '';
    this.editTitle = this.profile?.title || '';
    this.editBio = this.profile?.bio || '';
    this.tempAvatar = this.profile?.avatar || '';
    this.editLocation = this.profile?.location || '';
    this.editPhone = this.profile?.phone || '';
    this.editModal.present();

    const data = {
      editName: this.profile?.name || '',
      editTitle: this.profile?.title || '',
      editBio: this.profile?.bio || '',
      tempAvatar: this.profile?.avatar || '',
      editLocation: this.profile?.location || '',
      editPhone: this.profile?.phone || '',
    };
    const result = await this._service.openModal(ModalEditUserComponent, { data }, { cssClass: 'modal-edit-user' });
    if (result.data) {
      if (this.profile) {
        this.profile.name = result.data.editName;
        this.profile.title = result.data.editTitle;
        this.profile.bio = result.data.editBio;
        this.profile.avatar = result.data.tempAvatar;
        this.profile.location = result.data.editLocation;
        this.profile.phone = result.data.editPhone;
      }
      await this.showToast('Perfil actualizado correctamente', 'success');
    }
  }

  closeEditModal() {
    this.editModal.dismiss();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      try {
        const res = await this.authService.saveAvatar(this.selectedFile);
        reader.onload = (e) => {
          this.tempAvatar = e.target?.result as string;
          if (this.profile) {
            this.profile.avatar = this.tempAvatar;
          }
        };
        reader.readAsDataURL(input.files[0]);
      } catch (error) {

      }
    }
  }

  async selectPresetAvatar(url: string) {
    this.tempAvatar = url;
    this.selectedFile = null;
  }

  async saveProfile() {
    try {
      const payload: any = {};
      if (this.profile) {
        if (this.editName !== this.profile.name) payload.name = this.editName;
        if (this.editTitle !== this.profile.title) payload.title = this.editTitle;
        if (this.editBio !== this.profile.bio) payload.bio = this.editBio;
        if (this.editLocation !== this.profile.location) payload.location = this.editLocation;
        if (this.editPhone !== this.profile.phone) payload.phone = this.editPhone;
      }
      const res = await this.authService.updateProfile(payload);
      if (res.success) {
        if (this.profile) {
          this.profile.name = this.editName;
          this.profile.title = this.editTitle;
          this.profile.bio = this.editBio;
          this.profile.location = this.editLocation;
          this.profile.phone = this.editPhone;
        }
        this.editModal.dismiss();
        await this.showToast('Perfil actualizado correctamente', 'success');
      }
    } catch (error) {
      console.log(error);
    }
  }

  // ============ UTILIDADES ============

  async showToast(message: string, color: string = 'primary') {
    const toast = await this._service.Toast({
      message,
      duration: 2500,
      position: 'bottom',
      color,
      cssClass: 'custom-toast',
      buttons: [{ icon: 'close-outline', role: 'cancel' }]
    });
  }

  getSkillStyle(index: number) {
    const style = this.skillColors[index % this.skillColors.length];
    return {
      background: style.bg,
      color: style.color,
      borderColor: style.border
    };
  }

  getStarArray(rating: number): ('full' | 'half' | 'empty')[] {
    const stars: ('full' | 'half' | 'empty')[] = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) stars.push('full');
      else if (rating >= i - 0.5) stars.push('half');
      else stars.push('empty');
    }
    return stars;
  }

  navigate(route: string) {
    // this.router.navigate([route]);
    console.log('Navigate to:', route);
    const url = `/home${route}`;
    this._service.url(url);
  }

  shareProfile() {
    // Implementar share API
    this.showToast('Enlace copiado al portapapeles', 'success');
  }
}