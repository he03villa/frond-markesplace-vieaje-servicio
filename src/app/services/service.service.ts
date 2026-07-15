import { inject, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AlertController, ModalController, ToastController, LoadingController } from '@ionic/angular/standalone';
import { WebsocketService } from './websocket.service';
import { ChatSocketService } from './chat-socket.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private _route: Router = inject(Router);
  protected alertController: AlertController = inject(AlertController);
  private modalCtrl: ModalController = inject(ModalController);
  private toastController: ToastController = inject(ToastController);
  private loadingController: LoadingController = inject(LoadingController);
  private injector: Injector = inject(Injector);

  url(textUrl: String, data: any = undefined) {
    this._route.navigate([textUrl], data);
  }

  async promise(observable: Observable<any>) {
    try {
      return await firstValueFrom(observable);
    } catch (error: any) {
      const dataModal = {
        message: 'Error',
        buttons: ['Aceptar'],
      };
      dataModal.message = this.getErrorMessage(error);
      dataModal.message = dataModal.message == 'Unauthorized' ? 'Revisa tu correo o contraseña' : dataModal.message;
      if (!dataModal.message || dataModal.message === 'undefined' || dataModal.message === 'null') {
        dataModal.message = 'Error desconocido. Por favor, intenta nuevamente.';
      }

      console.error('Error en la solicitud:', error);
      this.Alert(dataModal);
      throw error; // Mantenemos el rechazo de la promesa
    }
  }

  getErrorMessage(error: any): string {
    // Si no hay error o no tiene la estructura esperada
    if (!error) {
      return 'Error desconocido. Por favor, intenta nuevamente.';
    }

    const _sanitize = (msg: string): string =>
      !msg || msg === 'undefined' || msg === 'null'
        ? 'Error desconocido. Por favor, intenta nuevamente.'
        : msg;

    // Caso 1: Error con campo 'error' directo (objeto con error simple)
    if (error.error && typeof error.error === 'object') {
      // Subcaso 1a: { error: "Unauthorized" }
      if (typeof error.error.error === 'string') {
        return _sanitize(error.error.error);
      }

      // Subcaso 1b: { error: { email: ["El email no existe."] } }
      // Buscar el primer array de mensajes
      const errorFields = Object.keys(error.error);
      for (const field of errorFields) {
        if (Array.isArray(error.error[field]) && error.error[field].length > 0) {
          // Retornar el primer mensaje del array
          return _sanitize(error.error[field][0]);
        }
      }

      // Si error.error es un objeto pero no coincide con los casos anteriores
      if (Object.keys(error.error).length > 0) {
        if (typeof error.error.message === 'string') {
          return _sanitize(error.error.message);
        }
        return _sanitize(JSON.stringify(error.error));
      }
    }

    // Caso 2: Error con mensaje directo
    if (error.error && typeof error.error === 'string') {
      return _sanitize(error.error);
    }

    // Caso 3: Usar el mensaje del HttpErrorResponse
    if (error.message) {
      return _sanitize(error.message);
    }

    // Caso 4: Error basado en status code
    if (error.status) {
      switch (error.status) {
        case 400:
          return 'Solicitud incorrecta. Verifica los datos ingresados.';
        case 401:
          return 'No autorizado. Verifica tus credenciales.';
        case 403:
          return 'Acceso denegado.';
        case 404:
          return 'Recurso no encontrado.';
        case 500:
          return 'Error interno del servidor.';
        default:
          return _sanitize(`Error ${error.status}: ${error.statusText || 'Error desconocido'}`);
      }
    }

    // Fallback final
    return 'Error desconocido. Por favor, intenta nuevamente.';
  }

  addLoading(target: any) {
    if (target) {
      target.innerHTML += " <i class='fas fa-spinner fa-pulse'></i>";
      target.disabled = true;
    } else {
      console.error('El elemento HTML es nulo.');
    }
  }


  removeLoading(target: any) {
    if (target) {
      let spinner = target.lastChild;
      if (spinner) {
        target.removeChild(spinner);
      }
      target.disabled = false;
    } else {
      console.error('El elemento HTML es nulo.');
    }
  }

  async Alert(data: any) {
    const alert = await this.alertController.create(data);
    await alert.present();
    return alert;
  }

  async Toast(data: any) {
    const toast = await this.toastController.create(data);

    await toast.present();
  }

  async openModal(component: any, data: any, option: any = undefined) {
    const modal = await this.modalCtrl.create({
      component: component,
      componentProps: data,
      mode: 'ios',
      ...option
    });
    modal.present();

    return await modal.onWillDismiss();
  }

  errorImage(event: any) {
    event.target.src = "https://ui-avatars.com/api/?name=Sin+imagen&color=FFFFFF&background=09090b&rounded=true&size=50";
  }

  getErrorImage() {
    return environment.errorImagen;
  }

  formValidate(formInstance: any) {
    Object.keys(formInstance.controls).forEach(field => {
      const control = formInstance.get(field);
      control?.markAsTouched();
    });
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: color
    });
    toast.present();
  }

  async presentLoading(data: any) {
    const loading = await this.loadingController.create(data);
    return loading;
  }

  logout() {
    localStorage.removeItem('dataUser');
    localStorage.removeItem('token');

    try {
      const websocketService = this.injector.get(WebsocketService);
      websocketService.disconnect();
    } catch {}

    try {
      const chatSocketService = this.injector.get(ChatSocketService);
      chatSocketService.disconnect();
    } catch {}

    try {
      const authService = this.injector.get(AuthService);
      authService.emitUser(null);
    } catch {}

    this._route.navigateByUrl('/login?sessionExpired=true');
  }
}
