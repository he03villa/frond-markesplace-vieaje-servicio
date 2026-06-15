import { Component, inject, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ModalController, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { briefcaseOutline, callOutline, camera, checkmarkCircle, checkmarkOutline, closeOutline, documentTextOutline, locationOutline, personOutline } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-edit-user',
  templateUrl: './modal-edit-user.component.html',
  styleUrls: ['./modal-edit-user.component.scss'],
  standalone: true,
  imports: [IonIcon, FormsModule]
})
export class ModalEditUserComponent  implements OnInit {

  @Input() data: any;

  private authService = inject(AuthService);
  private modalCtr: ModalController = inject(ModalController);

  editName = '';
  editTitle = '';
  editBio = '';
  tempAvatar = '';
  editLocation = '';
  editPhone = '';
  selectedFile: File | null = null;

  constructor() { 
    addIcons({
      closeOutline, camera, checkmarkCircle, personOutline, callOutline, briefcaseOutline,
      locationOutline, documentTextOutline, checkmarkOutline
    });
  }

  ngOnInit() {
    this.editName = this.data?.editName || '';
    this.editTitle = this.data?.editTitle || '';
    this.editBio = this.data?.editBio || '';
    this.tempAvatar = this.data?.tempAvatar || '';
    this.editLocation = this.data?.editLocation || '';
    this.editPhone = this.data?.editPhone || '';
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
          if (this.data) {
            this.data.avatar = this.tempAvatar;
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
      if (this.data) {
        if (this.editName !== this.data.editName) payload.name = this.editName;
        if (this.editTitle !== this.data.editTitle) payload.title = this.editTitle;
        if (this.editBio !== this.data.editBio) payload.bio = this.editBio;
        if (this.editLocation !== this.data.editLocation) payload.location = this.editLocation;
        if (this.editPhone !== this.data.editPhone) payload.phone = this.editPhone;
      }
      const res = await this.authService.updateProfile(payload);
      if (res.success) {
        this.data.editName = res.data.name;
        this.data.editTitle = res.data.title;
        this.data.editBio = res.data.bio;
        this.data.editLocation = res.data.location;
        this.data.editPhone = res.data.phone;
        this.data.tempAvatar = this.tempAvatar;
        this.salir(this.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  salir(data: any = undefined) {
    this.modalCtr.dismiss(data);
  }

}
