// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { API_ENDPOINTS } from './api-endpoints';

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8003/api',
  errorImagen: 'https://ui-avatars.com/api/?name=Sin+imagen&color=FFFFFF&background=09090b&rounded=true&size=50',
  VITE_REVERB_APP_KEY: 'dforgzvziwfaaa6se9yy',
  VITE_REVERB_PORT: 8004,
  VITE_REVERB_HOST: 'localhost',
  VITE_REVERB_SCHEME: 'http',
  cluster: 'mt1',
  urlBase: 'http://localhost:8003',
  api: API_ENDPOINTS
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
