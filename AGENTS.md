# Marketplace de Servicios y Viajes Compartidos

Ionic + Angular 20 standalone + Capacitor 8 mobile app (Android/Web).  
Service marketplace + ride-sharing with real-time chat.

## Quick commands

```sh
npm start           # ng serve (dev server)
npm run build       # ng build -> www/
npm run watch       # ng build --watch --configuration development
npm test            # ng test (Karma + Jasmine, Chrome)
npm run lint        # ng lint (@angular-eslint, covers .ts + .html)
npx cap copy        # copy web build to Capacitor platforms
npx cap sync        # sync + copy
npx cap open android
```

Test: `npm test` (Karma + Jasmine, requires Chrome). No headless CI runner configured.

The Ionic CLI (`ionic`) wraps the Angular CLI. Either works:

```sh
ionic serve                     # same as npm start
ionic build                     # same as npm run build
ionic build --prod              # production build (default)
ionic generate page <name>      # standalone page via Ionic schematics
ionic generate component <name> # standalone component via Ionic schematics
ionic generate service <name>
ionic capacitor copy android    # copy web build to Capacitor Android
ionic capacitor sync android    # sync + copy to Android
ionic capacitor open android    # open Android Studio
```

## Architecture

- **Standonly components** — `bootstrapApplication` in `src/main.ts`, no NgModules. All routes use `loadComponent` or `loadChildren`.
- **Tab shell** — `HomePage` (`src/app/pages/home/`) owns child routes: home/initiate, search, messages, profile, plus detail and sub-pages. The `AppComponent` auto-hides `ion-tab-bar` on `HIDDEN_TAB_ROUTES` (chat-conversation, reviews, my-services, my-rides, stats, settings). If you add a route that should hide the tab bar, update the array.
- **Auth routes** — `/login`, `/register`, `/onboarding`, `/forgot-password`, `/email-verified` are outside the tab shell. No `canActivate` guards — protection is via interceptor + `ServiceService` redirects to `/login` on 401.
- **API layer** — `DataService` (HttpClient wrapper) → `ServiceService` (`firstValueFrom` converts every Observable to Promise, handles errors, shared UI helpers) → domain services (`AuthService`, `RidesService`, `ChatService`, etc.).
- **Promise convention** — all domain services return `Promise`, never `Observable`. This avoids nested callbacks when multiple sequential API calls are needed. **Always use `ServiceService.promise()` for new services.**
- **Environment** — `src/environments/environment.ts` (dev: `localhost:8003/api`), swapped with `environment.prod.ts` in production builds. Centralized endpoints in `api-endpoints.ts`. URLs are built as template strings: `` `${apiUrl}/${api.user.name}/${api.user.services.login}` ``.
- **Auth** — JWT token in `localStorage['token']`, user data in `localStorage['dataUser']`. `auth.interceptor.ts` adds `Authorization: Bearer` to all HTTP requests. On 401, `ServiceService` auto-clears storage and redirects to `/login`.
- **Real-time** — two separate WebSocket services:
  - `ChatSocketService` — listens on `conversation.{id}` for `.user.typing`, `.message.sent`, `.messages.read`.
  - `WebsocketService` — listens on `service.{id}`, `ride.{id}`, `user.{id}` for offers, deliveries, passenger/ride status changes.
  Both use Laravel Echo + Pusher (`pusher-js`). Voice recording via `capacitor-voice-recorder`.
- **Maps** — Leaflet + `leaflet-routing-machine`. Leaflet CSS imported in `angular.json` styles (global, not per-component).
- **Dark mode** — toggled via `body.dark` / `[data-theme="dark"]`, variables in `src/theme/variables.scss`.
- **Chat routes** — `chat-conversation` has two variants: `:id/chat-conversation` (by conversation ID) and `:user/chat-conversation-users` (by user ID).

## Conventions

- **Promise-only services** — new services must follow `ServiceService.promise()` pattern. Never `.subscribe()` to an Observable in a service. Never return `Observable` from a domain service.
- **Modals** — use `ServiceService.openModal()` which wraps `ModalController.create()` with `mode: 'ios'`. Do not create modals manually.
- **Form validation** — use `ServiceService.formValidate()` to mark all controls as touched.
- **Inline loading** — use `ServiceService.addLoading()` / `removeLoading()` for inline spinner spinners (not the Ionic loading controller).
- **Icons** — `ionicons` registered via `addIcons()` in `HomePage`, not imported directly in templates. Font Awesome available via CDN in `index.html`.

## Notable config

- **Build output**: `www/` (Capacitor expects this).
- **Android**: `capacitor.config.ts` sets `cleartext: true`, `allowMixedContent: true` (HTTP dev backend).
- **TypeScript**: `strict: true`, `useDefineForClassFields: false` (Angular compat).
- **Production budgets**: 15 MB initial, 200 KB any component style.
- **Styles entry**: `src/global.scss`, `src/theme/variables.scss`, `src/theme/person.scss`, Leaflet CSS, chat theme SCSS files.
- **Ionic schematics**: pages/components use `@ionic/angular-toolkit`, `styleext: scss`, `standalone: true` for pages.
- **ESLint**: `@angular-eslint` — component selector prefix `app`, kebab-case elements, camelCase directives.
- **Browser targets**: Chrome 107+, Firefox 106+, Edge 107+, Safari/iOS 16.1+.
- **HTTP client** — `provideHttpClient(withFetch())` uses Fetch API, not XHR.
- **UI language** — Spanish (alerts, toasts, component/file names).
- **Theme persistence** — `ThemeService` saves preference in `localStorage['app-theme']` and toggles `body.dark`/`ion-palette-dark` classes.
- **Login flow** — every login page manually stores `response.data.access_token` in `localStorage['token']`, `response.data.user` in `localStorage['dataUser']`, emits via `authService.emitUser()`, then navigates to `/home`. No centralized login helper.
- **`environment.prod.ts`** — does not exist yet. Must be created at `src/environments/environment.prod.ts` before production builds will work.

## Project structure

```
src/
  app/
    pages/          # One folder per route/page (lazy loaded)
    components/     # Shared UI components
    services/       # Domain services (auth, chat, rides, etc.)
    interface/      # TypeScript interfaces (ride-detail, service-detail, etc.)
    interceptor/    # auth.interceptor.ts
    pipes/          # time-ago, file-size pipes
    validators/     # password-validators
  environments/     # environment.ts + api-endpoints.ts
  theme/            # SCSS: variables, person, chat animations/responsive
```
