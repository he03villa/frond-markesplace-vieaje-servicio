import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonSegment, IonSegmentButton, IonLabel, IonItem, IonList, IonSelectOption, IonSpinner, IonInput, IonTextarea, IonSelect, IonDatetime, IonRange } from '@ionic/angular/standalone';
import { AlertController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-publicar',
  templateUrl: './publicar.page.html',
  styleUrls: ['./publicar.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonButton, IonButton, ReactiveFormsModule, IonSegment, IonSegmentButton, IonLabel, IonItem, IonList, IonSelectOption, IonSpinner, IonInput, IonTextarea, IonSelect, IonDatetime, IonRange]
})
export class PublicarPage implements OnInit {

  tipoPublicacion: string = 'servicio';
  servicioForm!: FormGroup;
  viajeForm!: FormGroup;
  isSubmitting: boolean = false;

  categorias = [
    { value: 'hogar', label: 'Hogar' },
    { value: 'construccion', label: 'Construcción' },
    { value: 'reparaciones', label: 'Reparaciones' },
    { value: 'otros', label: 'Otros' }
  ];

  private fb = inject(FormBuilder);
  private navCtrl = inject(NavController);
  private alertController = inject(AlertController);

  ngOnInit() {
    this.inicializarFormularios();
  }

  inicializarFormularios() {
    // Formulario de Servicio
    this.servicioForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      categoria: ['hogar', Validators.required],
      medidas: [''],
      presupuesto: ['', [Validators.required, Validators.min(10000)]],
      ubicacion: ['', Validators.required],
      fechaLimite: [this.obtenerFechaMinima(), Validators.required]
    });

    // Formulario de Viaje
    this.viajeForm = this.fb.group({
      origen: ['', [Validators.required, Validators.minLength(3)]],
      destino: ['', [Validators.required, Validators.minLength(3)]],
      fechaHora: [this.obtenerFechaHoraMinima(), Validators.required],
      asientos: [1, [Validators.required, Validators.min(1), Validators.max(6)]],
      costo: ['', [Validators.required, Validators.min(1000)]],
      descripcion: ['']
    });
  }

  tipoPublicacionChange(event: any) {
    this.tipoPublicacion = event.detail.value;
  }

  async publicarServicio() {
    if (this.servicioForm.invalid) {
      this.marcarFormularioComoTocado(this.servicioForm);
      await this.mostrarError('Por favor completa todos los campos requeridos correctamente.');
      return;
    }

    this.isSubmitting = true;

    try {
      const servicioData = {
        ...this.servicioForm.value,
        id: this.generarId(),
        fechaCreacion: new Date(),
        ofertas: 0,
        user: this.obtenerUsuarioActual()
      };

      // Aquí iría la llamada a tu servicio/api
      // await this.serviciosService.crearServicio(servicioData);

      // Simular delay de publicación
      await new Promise(resolve => setTimeout(resolve, 1500));

      await this.mostrarExito('Servicio publicado exitosamente');
      this.navCtrl.navigateBack('/home');

    } catch (error) {
      await this.mostrarError('Error al publicar el servicio. Intenta nuevamente.');
    } finally {
      this.isSubmitting = false;
    }
  }

  async publicarViaje() {
    if (this.viajeForm.invalid) {
      this.marcarFormularioComoTocado(this.viajeForm);
      await this.mostrarError('Por favor completa todos los campos requeridos correctamente.');
      return;
    }

    this.isSubmitting = true;

    try {
      const viajeData = {
        ...this.viajeForm.value,
        id: this.generarId(),
        fecha: new Date(this.viajeForm.get('fechaHora')?.value),
        horaSalida: this.formatearHora(this.viajeForm.get('fechaHora')?.value),
        horaLlegada: this.calcularHoraLlegada(this.viajeForm.get('fechaHora')?.value),
        asientosDisponibles: this.viajeForm.get('asientos')?.value,
        costoPorPersona: this.viajeForm.get('costo')?.value,
        conductor: this.obtenerUsuarioActual()
      };

      // Aquí iría la llamada a tu servicio/api
      // await this.viajesService.crearViaje(viajeData);

      // Simular delay de publicación
      await new Promise(resolve => setTimeout(resolve, 1500));

      await this.mostrarExito('Viaje publicado exitosamente');
      this.navCtrl.navigateBack('/home');

    } catch (error) {
      await this.mostrarError('Error al publicar el viaje. Intenta nuevamente.');
    } finally {
      this.isSubmitting = false;
    }
  }

  cancelar() {
    this.navCtrl.navigateBack('/home');
  }

  // Métodos auxiliares
  private obtenerFechaMinima(): string {
    const hoy = new Date();
    return hoy.toISOString();
  }

  private obtenerFechaHoraMinima(): string {
    const ahora = new Date();
    // Permitir publicar viajes desde 1 hora en adelante
    ahora.setHours(ahora.getHours() + 1);
    return ahora.toISOString();
  }

  private generarId(): number {
    return Math.floor(Math.random() * 1000000);
  }

  private obtenerUsuarioActual() {
    // En una app real, esto vendría de tu servicio de autenticación
    return {
      id: 1,
      nombre: 'Usuario Actual',
      avatar: 'assets/avatars/avatar1.svg',
      rating: 4.5,
      viajesCompletados: 10
    };
  }

  private formatearHora(fechaHora: string): string {
    const fecha = new Date(fechaHora);
    return fecha.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  private calcularHoraLlegada(fechaHora: string): string {
    const fecha = new Date(fechaHora);
    // Simular 30-45 minutos de viaje
    const duracionViaje = 30 + Math.floor(Math.random() * 15);
    fecha.setMinutes(fecha.getMinutes() + duracionViaje);
    
    return fecha.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  private marcarFormularioComoTocado(form: FormGroup) {
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.markAsTouched();
    });
  }

  private async mostrarExito(mensaje: string) {
    const alert = await this.alertController.create({
      header: '¡Éxito!',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Getters para acceder fácilmente a los controles en el template
  get servicioTitulo() { return this.servicioForm.get('titulo'); }
  get servicioDescripcion() { return this.servicioForm.get('descripcion'); }
  get servicioPresupuesto() { return this.servicioForm.get('presupuesto'); }
  get servicioUbicacion() { return this.servicioForm.get('ubicacion'); }

  get viajeOrigen() { return this.viajeForm.get('origen'); }
  get viajeDestino() { return this.viajeForm.get('destino'); }
  get viajeFechaHora() { return this.viajeForm.get('fechaHora'); }
  get viajeCosto() { return this.viajeForm.get('costo'); }

  // Validación de errores para mostrar mensajes
  getErrorMessages(control: any): string {
    if (control?.errors) {
      if (control.errors['required']) return 'Este campo es requerido';
      if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['min']) return `El valor mínimo es ${control.errors['min'].min}`;
      if (control.errors['max']) return `El valor máximo es ${control.errors['max'].max}`;
    }
    return '';
  }

}
