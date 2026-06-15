import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  
  async getCurrentPosition(): Promise<{lat: number, lng: number} | null> {
    // WEB: Usar API nativa del navegador directamente
    if (Capacitor.getPlatform() === 'web') {
      return this.getWebGeolocation();
    }
    
    // NATIVO: Usar plugin de Capacitor
    return this.getNativeGeolocation();
  }

  private getWebGeolocation(): Promise<{lat: number, lng: number} | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('Geolocalización no soportada en este navegador');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error GPS web:', error.message);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  private async getNativeGeolocation(): Promise<{lat: number, lng: number} | null> {
    try {
      // Importación dinámica solo para nativo
      const { Geolocation } = await import('@capacitor/geolocation');
      
      const permission = await Geolocation.requestPermissions();
      
      if (permission.location !== 'granted') {
        console.warn('Permiso de ubicación denegado');
        return null;
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
    } catch (error) {
      console.error('Error GPS nativo:', error);
      return null;
    }
  }
}