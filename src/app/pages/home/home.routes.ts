import { Routes } from '@angular/router';
import { HomePage } from './home.page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: 'home',
        loadComponent: () => import('../initiate/initiate.page').then((m) => m.InitiatePage),
      },
      {
        path: 'search',
        loadComponent: () => import('../search/search.page').then((m) => m.SearchPage),
      },
      {
        path: 'messages',
        redirectTo: '/home/chat-inbox',
        pathMatch: 'full'
      },
      {
        path: 'profile',
        loadComponent: () => import('../perfil/perfil.page').then(m => m.PerfilPage)
      },
      {
        path: ':id/service-detail',
        loadComponent: () => import('../service-detail/service-detail.page').then(m => m.ServiceDetailPage)
      },
      {
        path: ':id/ride-detail',
        loadComponent: () => import('../ride-detail/ride-detail.page').then(m => m.RideDetailPage)
      },
      {
        path: 'chat-inbox',
        loadComponent: () => import('../chat-inbox/chat-inbox.page').then(m => m.ChatInboxPage)
      },
      {
        path: ':id/chat-conversation',
        loadComponent: () => import('../chat-conversation/chat-conversation.page').then(m => m.ChatConversationPage)
      },
      {
        path: ':user/chat-conversation-users',
        loadComponent: () => import('../chat-conversation/chat-conversation.page').then(m => m.ChatConversationPage)
      },
      {
        path: 'chat-profile',
        redirectTo: '/home/profile',
        pathMatch: 'full'
      },
      {
        path: 'reviews',
        loadComponent: () => import('../reviews/reviews.page').then(m => m.ReviewsPage)
      },

      {
        path: 'my-services',
        loadComponent: () => import('../my-services/my-services.page').then(m => m.MyServicesPage)
      },
      {
        path: 'my-rides',
        loadComponent: () => import('../my-rides/my-rides.page').then(m => m.MyRidesPage)
      },
      {
        path: 'stats',
        loadComponent: () => import('../statistics/statistics.page').then(m => m.StatisticsPage)
      },
      {
        path: 'settings',
        loadComponent: () => import('../settings/settings.page').then(m => m.SettingsPage)
      },
      {
        path: 'notifications',
        loadComponent: () => import('../notifications/notifications.page').then(m => m.NotificationsPage)
      },
      {
        path: '',
        redirectTo: '/home/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/home/home',
    pathMatch: 'full',
  },
];