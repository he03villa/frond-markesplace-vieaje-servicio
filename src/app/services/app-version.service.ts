import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';

@Injectable({
  providedIn: 'root',
})
export class AppVersionService {
  async getAppInfo(): Promise<{
    version: string;
    build: string;
    platform: string;
  }> {
    try {
      const info = await App.getInfo();
      return {
        version: info.version,      // ej: "2.4.1"
        build: info.build,          // ej: "892"
        platform: info.name,        // ej: "ios", "android", "web"
      };
    } catch (error) {
      // Fallback para web/desktop
      return {
        version: '0.0.1',           // Tu versión manual
        build: '0',                 // Tu build manual
        platform: 'web'
      };
    }
  }
}
