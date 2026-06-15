import { Component, inject, ViewChild } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, AnimationController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircle, chatbubbles, home, person, search } from 'ionicons/icons';
import { ModalCreateServicesRideComponent } from 'src/app/components/modal-create-services-ride/modal-create-services-ride.component';
import { ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class HomePage {

  @ViewChild(IonTabs) tabs: IonTabs | undefined;
  _services:ServiceService = inject(ServiceService);
  private animationCtrl: AnimationController = inject(AnimationController);

  constructor() {
    /**
     * Any icons you want to use in your application
     * can be registered in app.component.ts and then
     * referenced by name anywhere in your application.
     */
    addIcons({ addCircle, home, chatbubbles, person, search });
  }

  ngOnInit() {
    
  }

  async onTabChange(event: any) {
    const selectedTab = event.tab;
    
    // Haptic feedback si está disponible
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    // Animación de entrada para el contenido
    const content = document.querySelector(`[tab="${selectedTab}"]`);
    if (content) {
      const animation = this.animationCtrl.create()
        .addElement(content)
        .duration(300)
        .fromTo('opacity', '0', '1')
        .fromTo('transform', 'translateY(10px)', 'translateY(0)');
      
      await animation.play();
    }
  }

  async abrirModalPublication() {
    const addBtn = document.querySelector('.btn-add');
    
    // Animación de escala antes de abrir
    const animation = this.animationCtrl.create()
      .addElement(addBtn as HTMLElement)
      .duration(200)
      .fromTo('transform', 'scale(1)', 'scale(0.9)')
      .fromTo('transform', 'scale(0.9)', 'scale(1.2)')
      .fromTo('transform', 'scale(1.2)', 'scale(1)');
    
    await animation.play();
    this._services.openModal(ModalCreateServicesRideComponent, {}, {});
  }
  
}
