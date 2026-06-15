import { inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'app-theme';
  private currentTheme: 'light' | 'dark' | 'system' = 'system';
  private platform: Platform = inject(Platform);
  rendererFactory: RendererFactory2 = inject(RendererFactory2);
  private renderer = this.rendererFactory.createRenderer(null, null);

  constructor() {
    this.initTheme();
  }

  private initTheme() {
    // Check saved preference
    const saved = localStorage.getItem(this.STORAGE_KEY) as 'light' | 'dark' | 'system' | null;
    
    if (saved) {
      this.setTheme(saved);
    } else {
      // Default to system preference
      this.setTheme('system');
    }

    // Listen for system changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        if (this.currentTheme === 'system') {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  setTheme(theme: 'light' | 'dark' | 'system') {
    this.currentTheme = theme;
    localStorage.setItem(this.STORAGE_KEY, theme);

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme(prefersDark ? 'dark' : 'light');
    } else {
      this.applyTheme(theme);
    }
  }

  private applyTheme(theme: 'light' | 'dark') {
    const body = document.body;
    
    if (theme === 'dark') {
      this.renderer.addClass(body, 'dark');
      // Ionic dark class
      this.renderer.setAttribute(body, 'class', `${body.className} ion-palette-dark`);
    } else {
      this.renderer.removeClass(body, 'dark');
      this.renderer.removeClass(body, 'ion-palette-dark');
    }
  }

  toggleTheme() {
    const newTheme = this.isDark() ? 'light' : 'dark';
    this.setTheme(newTheme);
    return newTheme;
  }

  isDark(): boolean {
    return document.body.classList.contains('dark');
  }

  getCurrentTheme(): 'light' | 'dark' | 'system' {
    return this.currentTheme;
  }
}
