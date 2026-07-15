import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { ErrorComponent } from 'src/app/components/error/error.component';
import { ServiceService } from 'src/app/services/service.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, ErrorComponent, IonContent]
})
export class LoginPage implements OnInit {

  _service: ServiceService = inject(ServiceService);
  private fb: FormBuilder = inject(FormBuilder);
  private _authService: AuthService = inject(AuthService);
  private route: ActivatedRoute = inject(ActivatedRoute);

  form : FormGroup = new FormGroup({});
  showPassword: boolean = false;
  isLoading = false;

  constructor() { }

  ionViewWillEnter() {
    this.iniciarForm();
  }

  ngOnInit() {
    this.iniciarForm();
    this.route.queryParams.subscribe(params => {
      if (params['sessionExpired'] === 'true') {
        this._service.presentToast('Tu sesión ha expirado. Inicia sesión nuevamente.', 'warning');
      }
    });
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
    if (this.form.valid) {
      const data = this.form.value;
      this.isLoading = true;
      try {
        const response = await this._authService.login(data);
        if (response.success) {
          this._authService.saveSession(response.data);
          this.isLoading = false;
          this._service.url('/home');
        }
      } catch (error) {
        console.error(error);
      }
      this.isLoading = false;
    } else {
      this.form.markAllAsTouched();
      this._service.formValidate(this.form);
    }
  }

}
