import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonSegmentButton, IonCard, IonCardContent, IonSegment, IonItem, IonLabel, IonInput, IonButton } from '@ionic/angular/standalone';
import { ErrorComponent } from 'src/app/components/error/error.component';
import { ServiceService } from 'src/app/services/service.service';
import { AuthService } from 'src/app/services/auth.service';
import { PasswordValidators } from 'src/app/validators/password-validators';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, ErrorComponent]
})
export class LoginPage implements OnInit {

  _service: ServiceService = inject(ServiceService);
  private fb: FormBuilder = inject(FormBuilder);
  private _authService: AuthService = inject(AuthService);

  form : FormGroup = new FormGroup({});
  showPassword: boolean = false;
  isLoading = false;

  constructor() { }

  ngOnInit() {
    this.iniciarForm();
  }

  iniciarForm() {
    this.form = this.fb.group({
      email: [null, Validators.compose([Validators.required, Validators.email])],
      password: [null, Validators.compose([Validators.required, Validators.minLength(8)])],
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async login(event: Event) {
    event.preventDefault();
    const target = event.target as HTMLFormElement;
    this._service.addLoading(target);
    console.log(this.form);
    if (this.form.valid) {
      const data = this.form.value;
      console.log(data);
      this.isLoading = true;
      try {
        const response = await this._authService.login(data);
        console.log(response);
        if (response.success) {
          this._authService.saveSession(response.data);
          this.isLoading = false;
          this._service.url('/home');
        }
      } catch (error) {
        console.error(error);
      }
      this._service.removeLoading(target);
    } else {
      this.form.markAllAsTouched();
      this._service.formValidate(this.form);
      this._service.removeLoading(target);
      this.isLoading = false;
    }
  }

}
