import { Injectable, NgZone } from '@angular/core';
import { AnimationController, Platform } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Subject } from 'rxjs';
import { TabChangeEvent } from '../interface/tab-change-event';

@Injectable({
  providedIn: 'root',
})
export class UiEffectsService {
  public tabChange$ = new Subject<TabChangeEvent>();
  public scrollPosition$ = new Subject<number>();
  
  // Estado
  private hapticAvailable = false;
  private scrollListeners: Map<string, () => void> = new Map();
  private intersectionObservers: Map<string, IntersectionObserver> = new Map();

  private animationCtrl: AnimationController | undefined
  private platform: Platform | undefined
  private ngZone: NgZone | undefined

  constructor() { 
    this.init();
  }

  private async init() {
    // Verificar disponibilidad de haptics
    if (this.platform?.is('capacitor') || this.platform?.is('mobile')) {
      try {
        await Haptics.selectionStart();
        this.hapticAvailable = true;
      } catch (e) {
        console.log('Haptics not available');
      }
    }
  }

  /**
   * Anima contadores numéricos al entrar en viewport
   * @param selector Selector CSS de los elementos contador
   * @param duration Duración de la animación en ms
   */
  animateCounters(selector: string = '.counter', duration: number = 1500): void {
    const counters = document.querySelectorAll(selector);
    
    counters.forEach((counter, index) => {
      const target = parseInt(counter.getAttribute('data-target') || '0');
      const step = target / (duration / 16);
      let current = 0;
      
      const updateCounter = () => {
        current += step;
        if (current < target) {
          counter.textContent = Math.floor(current).toString();
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target.toString();
        }
      };
      
      // Intersection Observer
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Delay escalonado
            setTimeout(() => updateCounter(), index * 100);
            observer.unobserve(counter);
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(counter);
      this.intersectionObservers.set(`counter-${index}`, observer);
    });
  }

  initOrbitalTabs(
    tabSelector: string = '.orbital-tab',
    indicatorSelector: string = '.tab-indicator',
    onTabChange?: (event: TabChangeEvent) => void
  ): void {
    const tabs = document.querySelectorAll(tabSelector);
    const indicator = document.querySelector(indicatorSelector);
    
    if (!indicator || tabs.length === 0) return;

    const updateIndicator = (activeTab: Element) => {
      const rect = activeTab.getBoundingClientRect();
      const parentRect = activeTab.parentElement?.getBoundingClientRect();
      
      if (!parentRect) return;
      
      this.ngZone?.runOutsideAngular(() => {
        (indicator as HTMLElement).style.width = `${rect.width}px`;
        (indicator as HTMLElement).style.left = `${rect.left - parentRect.left}px`;
      });
    };

    // Inicializar posición
    const activeTab = document.querySelector(`${tabSelector}.active`);
    if (activeTab) {
      setTimeout(() => updateIndicator(activeTab), 100);
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        // Actualizar clases
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Animar indicador
        updateIndicator(tab);

        // Feedback háptico
        this.triggerHaptic('light');

        // Notificar cambio
        const tabId = tab.getAttribute('data-tab') || `tab-${index}`;
        this.tabChange$.next({ tab: tabId, index });
        
        if (onTabChange) {
          this.ngZone?.run(() => onTabChange({ tab: tabId, index }));
        }

        // Animar contenido del panel
        this.animateTabContent(tabId);
      });
    });

    // Actualizar en resize
    const resizeHandler = () => {
      const currentActive = document.querySelector(`${tabSelector}.active`);
      if (currentActive) updateIndicator(currentActive);
    };
    
    window.addEventListener('resize', resizeHandler);
    this.scrollListeners.set('tab-resize', () => window.removeEventListener('resize', resizeHandler));
  }

  /**
   * Anima la entrada del contenido de un tab
   */
  private async animateTabContent(tabId: string): Promise<void> {
    const panel = document.getElementById(`${tabId}-panel`);
    if (!panel) return;

    await this.animationCtrl?.create()
      .addElement(panel)
      .duration(300)
      .easing('cubic-bezier(0.4, 0, 0.2, 1)')
      .fromTo('opacity', '0', '1')
      .fromTo('transform', 'translateY(10px)', 'translateY(0)')
      .play();
  }

  // ==========================================
  // Efectos de Scroll Avanzados
  // ==========================================
  
  /**
   * Inicializa efectos de scroll para header flotante
   * @param headerSelector Selector del header
   * @param contentSelector Selector del contenedor scrollable
   * @param options Opciones de configuración
   */
  initScrollEffects(
    headerSelector: string = '.floating-header',
    contentSelector: string = '.main-scroll',
    options: {
      hideThreshold?: number;
      blurThreshold?: number;
      parallaxElements?: string[];
    } = {}
  ): void {
    const header = document.querySelector(headerSelector) as HTMLElement;
    const content = document.querySelector(contentSelector) as HTMLElement;
    
    if (!header || !content) return;

    const { hideThreshold = 100, blurThreshold = 50, parallaxElements = [] } = options;
    
    let lastScroll = 0;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScroll = content.scrollTop;
          
          // Efecto blur en header
          const headerGlass = header.querySelector('.header-glass') as HTMLElement;
          if (headerGlass) {
            if (currentScroll > blurThreshold) {
              headerGlass.style.background = 'rgba(255, 255, 255, 0.95)';
              headerGlass.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
            } else {
              headerGlass.style.background = 'var(--glass-bg)';
              headerGlass.style.boxShadow = 'var(--glass-shadow)';
            }
          }

          // Hide/show header
          if (currentScroll > lastScroll && currentScroll > hideThreshold) {
            header.style.transform = 'translateY(-100%)';
          } else {
            header.style.transform = 'translateY(0)';
          }

          // Parallax para elementos
          parallaxElements.forEach((selector, index) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              const speed = 0.5 + (index * 0.2);
              (el as HTMLElement).style.transform = `translateY(${currentScroll * speed}px)`;
            });
          });

          // Emitir posición
          this.scrollPosition$.next(currentScroll);

          lastScroll = currentScroll;
          ticking = false;
        });
        ticking = true;
      }
    };

    content.addEventListener('scroll', handleScroll, { passive: true });
    this.scrollListeners.set('main-scroll', () => content.removeEventListener('scroll', handleScroll));
  }

  // ==========================================
  // FAB Morphing Button
  // ==========================================
  
  /**
   * Inicializa FAB con efecto morphing y menú expandible
   * @param fabSelector Selector del botón FAB
   * @param menuSelector Selector del menú de opciones
   * @param onAction Callback cuando se selecciona una opción
   */
  initMorphingFAB(
    fabSelector: string = '#main-fab',
    menuSelector: string = '.fab-menu',
    onAction?: (action: string) => void
  ): void {
    const fab = document.querySelector(fabSelector);
    const container = fab?.closest('.fab-container');
    
    if (!fab || !container) return;

    const toggleFab = () => {
      const isActive = fab.classList.contains('active');
      
      if (isActive) {
        fab.classList.remove('active');
        container.classList.remove('menu-open');
      } else {
        fab.classList.add('active');
        container.classList.add('menu-open');
        this.triggerHaptic('medium');
      }
    };

    fab.addEventListener('click', toggleFab);

    // Cerrar al hacer click fuera
    const closeOnClickOutside = (e: Event) => {
      if (!container.contains(e.target as Node) && fab.classList.contains('active')) {
        fab.classList.remove('active');
        container.classList.remove('menu-open');
      }
    };
    
    document.addEventListener('click', closeOnClickOutside);
    this.scrollListeners.set('fab-outside-click', () => document.removeEventListener('click', closeOnClickOutside));

    // Opciones del menú
    const options = container.querySelectorAll('.fab-option');
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const action = option.classList.contains('service') ? 'service' :
                      option.classList.contains('ride') ? 'ride' : 'request';
        
        // Animación de selección
        this.animateOptionSelection(option as HTMLElement);
        
        // Cerrar FAB
        fab.classList.remove('active');
        container.classList.remove('menu-open');
        
        // Callback
        if (onAction) {
          this.ngZone?.run(() => onAction(action));
        }
      });
    });
  }

  private async animateOptionSelection(element: HTMLElement): Promise<void> {
    await this.animationCtrl?.create()
      .addElement(element)
      .duration(200)
      .keyframes([
        { offset: 0, transform: 'scale(1)', opacity: '1' },
        { offset: 0.5, transform: 'scale(1.2)', opacity: '0.8' },
        { offset: 1, transform: 'scale(0)', opacity: '0' }
      ])
      .play();
  }

  // ==========================================
  // Menú Hamburguesa Morphing
  // ==========================================
  
  /**
   * Inicializa menú hamburguesa con animación morphing a X
   * @param selector Selector del botón de menú
   * @param onToggle Callback al abrir/cerrar
   */
  initMenuMorph(
    selector: string = '.menu-morph',
    onToggle?: (isOpen: boolean) => void
  ): void {
    const menuBtn = document.querySelector(selector);
    if (!menuBtn) return;

    let isOpen = false;

    menuBtn.addEventListener('click', () => {
      isOpen = !isOpen;
      menuBtn.classList.toggle('active', isOpen);
      this.triggerHaptic('light');
      
      if (onToggle) {
        this.ngZone?.run(() => onToggle(isOpen));
      }
    });
  }

   /**
   * Implementa pull-to-refresh con animación personalizada
   * @param contentSelector Selector del contenido scrollable
   * @param onRefresh Callback al activar el refresh
   */
  initPullToRefresh(
    contentSelector: string = '.main-scroll',
    onRefresh?: () => Promise<void>
  ): void {
    const content = document.querySelector(contentSelector) as HTMLElement;
    if (!content) return;

    let startY = 0;
    let pullDistance = 0;
    let isPulling = false;
    const threshold = 100;

    // Crear indicador visual
    const indicator = document.createElement('div');
    indicator.className = 'pull-indicator';
    indicator.innerHTML = `
      <div class="pull-spinner">
        <svg viewBox="0 0 24 24">
          <path fill="none" stroke="currentColor" stroke-width="2" 
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10"/>
        </svg>
      </div>
    `;
    content.parentElement?.insertBefore(indicator, content);

    const onTouchStart = (e: TouchEvent) => {
      if (content.scrollTop === 0) {
        startY = e.touches[0].pageY;
        isPulling = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isPulling || startY === 0) return;
      
      pullDistance = e.touches[0].pageY - startY;
      
      if (pullDistance > 0 && pullDistance < threshold * 1.5) {
        const rotation = Math.min((pullDistance / threshold) * 360, 360);
        const scale = Math.min(pullDistance / threshold, 1);
        
        indicator.style.opacity = scale.toString();
        indicator.style.transform = `translateY(${pullDistance * 0.5}px) rotate(${rotation}deg)`;
        
        if (pullDistance > threshold) {
          indicator.classList.add('ready');
        } else {
          indicator.classList.remove('ready');
        }
      }
    };

    const onTouchEnd = async () => {
      if (!isPulling) return;
      
      if (pullDistance > threshold && onRefresh) {
        indicator.classList.add('refreshing');
        this.triggerHaptic('medium');
        
        try {
          await onRefresh();
        } finally {
          indicator.classList.remove('refreshing', 'ready');
          indicator.style.opacity = '0';
          indicator.style.transform = 'translateY(0) rotate(0deg)';
        }
      } else {
        indicator.style.opacity = '0';
        indicator.style.transform = 'translateY(0) rotate(0deg)';
      }
      
      startY = 0;
      pullDistance = 0;
      isPulling = false;
    };

    content.addEventListener('touchstart', onTouchStart, { passive: true });
    content.addEventListener('touchmove', onTouchMove, { passive: true });
    content.addEventListener('touchend', onTouchEnd);

    this.scrollListeners.set('ptr', () => {
      content.removeEventListener('touchstart', onTouchStart);
      content.removeEventListener('touchmove', onTouchMove);
      content.removeEventListener('touchend', onTouchEnd);
    });
  }

  // ==========================================
  // Haptic Feedback
  // ==========================================
  
  /**
   * Dispara feedback háptico según la intensidad
   */
  async triggerHaptic(intensity: 'light' | 'medium' | 'heavy' = 'light'): Promise<void> {
    if (!this.hapticAvailable) {
      // Fallback a vibration API
      if ('vibrate' in navigator) {
        const patterns = { light: 10, medium: 20, heavy: 30 };
        navigator.vibrate(patterns[intensity]);
      }
      return;
    }

    try {
      switch (intensity) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
      }
    } catch (e) {
      console.error('Haptic error:', e);
    }
  }

  // ==========================================
  // Utilidades de Animación
  // ==========================================
  
  /**
   * Crea animación de entrada para elementos
   */
  async animateEntrance(
    selector: string,
    options: {
      duration?: number;
      delay?: number;
      from?: { opacity?: number; y?: number; scale?: number };
    } = {}
  ): Promise<void> {
    const elements = document.querySelectorAll(selector);
    const { duration = 500, delay = 0, from = { opacity: 0, y: 20, scale: 0.95 } } = options;

    const animation = this.animationCtrl?.create()
      .addElement(elements)
      .duration(duration)
      .delay(delay)
      .easing('cubic-bezier(0.4, 0, 0.2, 1)')
      .fromTo('opacity', from?.opacity || 0, 1)
      .fromTo('transform', 
        `translateY(${from.y}px) scale(${from.scale})`, 
        'translateY(0) scale(1)'
      );

    await animation?.play();
  }

  /**
   * Efecto "pulse" en elemento
   */
  async pulseElement(selector: string): Promise<void> {
    const element = document.querySelector(selector);
    if (!element) return;

    await this.animationCtrl?.create()
      .addElement(element)
      .duration(300)
      .keyframes([
        { offset: 0, transform: 'scale(1)' },
        { offset: 0.5, transform: 'scale(1.05)' },
        { offset: 1, transform: 'scale(1)' }
      ])
      .play();
  }

  // ==========================================
  // Limpieza
  // ==========================================
  
  /**
   * Limpia todos los listeners y observers
   */
  cleanup(): void {
    // Remover listeners de scroll
    this.scrollListeners.forEach(cleanup => cleanup());
    this.scrollListeners.clear();

    // Desconectar observers
    this.intersectionObservers.forEach(observer => observer.disconnect());
    this.intersectionObservers.clear();
  }

  /**
   * Limpia recursos específicos de un componente
   */
  cleanupComponent(componentId: string): void {
    // Remover listeners específicos
    const listener = this.scrollListeners.get(componentId);
    if (listener) {
      listener();
      this.scrollListeners.delete(componentId);
    }
  }

}
