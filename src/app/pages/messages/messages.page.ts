import { Component, inject } from '@angular/core';
import { IonButtons, IonButton, IonIcon, IonSearchbar, IonTextarea } from '@ionic/angular/standalone';
import { PageHeaderComponent } from 'src/app/components/page-header/page-header.component';
import { addIcons } from 'ionicons';
import { add, arrowBack, attachOutline, briefcaseOutline, callOutline, chatbubblesOutline, createOutline, ellipsisVertical, imageOutline, send } from 'ionicons/icons';
import { ServiceService } from 'src/app/services/service.service';

interface Message {
  id: number;
  sender: number;
  text: string;
  time: string;
  status: string;
}

interface Chat {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  service: string;
  lastActive: string;
  displayName: string | null;
  messages: Message[];
}

interface CurrentUser {
  id: number;
  name: string;
  avatar: string;
}

interface ChatData {
  currentUser: CurrentUser;
  chat: Chat;
  chats: Chat[];
  messages: { [key: number]: Message[] }; // ⭐ Esto es lo importante
}

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
  standalone: true,
  imports: [IonButtons, IonButton, IonIcon, IonSearchbar, IonTextarea, PageHeaderComponent]
})
export class MessagesPage {

  _service: ServiceService = inject(ServiceService);

  chatData: ChatData = {
    currentUser: {
      id: 1,
      name: "Juan Pérez",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },

    chat: {
      id: 1,
        userId: 2,
        userName: "María González",
        userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b786d4d7?w=100&h=100&fit=crop",
        lastMessage: "Perfecto, nos vemos a las 3pm",
        time: "10:45",
        unread: 2,
        online: true,
        service: "Reparación de grifo",
        lastActive: "En línea",
        messages: [],
        displayName: null
    },
    chats: [
      {
        id: 1,
        userId: 2,
        userName: "María González",
        userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b786d4d7?w=100&h=100&fit=crop",
        lastMessage: "Perfecto, nos vemos a las 3pm",
        time: "10:45",
        unread: 2,
        online: true,
        service: "Reparación de grifo",
        lastActive: "En línea",
        messages: [],
        displayName: null
      },
      {
        id: 2,
        userId: 3,
        userName: "Carlos Rodríguez",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        lastMessage: "El viaje está confirmado",
        time: "09:20",
        unread: 0,
        online: false,
        service: "Viaje al centro",
        lastActive: "Hace 2h",
        messages: [],
        displayName: null
      },
      {
        id: 3,
        userId: 4,
        userName: "Ana Martínez",
        userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
        lastMessage: "Te envío el presupuesto por correo",
        time: "Ayer",
        unread: 5,
        online: true,
        service: "Diseño de logotipo",
        lastActive: "En línea",
        messages: [],
        displayName: null
      },
      {
        id: 4,
        userId: 5,
        userName: "Pedro Sánchez",
        userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
        lastMessage: "El precio incluye materiales básicos",
        time: "Ayer",
        unread: 0,
        online: false,
        service: "Instalación eléctrica",
        lastActive: "Hace 1d",
        messages: [],
        displayName: null
      },
      {
        id: 5,
        userId: 6,
        userName: "Laura Fernández",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        lastMessage: "Clases martes y jueves por la tarde",
        time: "Lun",
        unread: 0,
        online: true,
        service: "Clases de matemáticas",
        lastActive: "En línea",
        messages: [],
        displayName: null
      }
    ],

    messages: {
      1: [
        { id: 1, sender: 2, text: "Hola Juan, vi tu publicación sobre la reparación del grifo", time: "10:30", status: "read" },
        { id: 2, sender: 1, text: "¡Hola María! Sí, necesito ayuda urgente con eso", time: "10:32", status: "read" },
        { id: 3, sender: 2, text: "Tengo experiencia en fontanería. ¿Podría visitarte hoy en la tarde?", time: "10:35", status: "read" },
        { id: 4, sender: 1, text: "¡Genial! ¿A qué hora te viene bien?", time: "10:40", status: "read" },
        { id: 5, sender: 2, text: "Perfecto, nos vemos a las 3pm en el punto acordado", time: "10:45", status: "delivered" }
      ],
      2: [
        { id: 1, sender: 3, text: "Hola, soy Carlos. Ofrezco el viaje al centro que publicaste", time: "09:15", status: "read" },
        { id: 2, sender: 1, text: "Hola Carlos, ¿todavía tienes disponibilidad para las 5pm?", time: "09:18", status: "read" },
        { id: 3, sender: 3, text: "Sí, todavía tengo un asiento disponible", time: "09:19", status: "read" },
        { id: 4, sender: 1, text: "Perfecto, ahí estaré. ¿Cuánto es el costo?", time: "09:19", status: "read" },
        { id: 5, sender: 3, text: "El viaje está confirmado, te espero en la parada", time: "09:20", status: "read" }
      ],
      3: [
        { id: 1, sender: 4, text: "Hola Juan, me interesa tu proyecto de logotipo", time: "16:30", status: "read" },
        { id: 2, sender: 1, text: "Hola Ana, gracias por contactarme", time: "16:45", status: "read" },
        { id: 3, sender: 4, text: "Tengo un portafolio con varios proyectos de empresas tecnológicas", time: "17:00", status: "read" },
        { id: 4, sender: 1, text: "Excelente. ¿Podrías enviarme algunos ejemplos?", time: "17:15", status: "read" },
        { id: 5, sender: 4, text: "Claro, te envío el presupuesto detallado por correo", time: "17:30", status: "delivered" }
      ]
    }
  };

  // Estado
  currentChatId: number | null = null;
  searchQuery = "";
  typingTimeout = null;
  constructor() {
    addIcons({ createOutline, chatbubblesOutline, add, arrowBack, callOutline, ellipsisVertical, imageOutline, briefcaseOutline, attachOutline, send });
  }

  openChat(chatId: number) {
    this.currentChatId = chatId;
    const chat = this.chatData.chats.find(c => c.id === chatId);
    console.log(chat);
    if (!chat) return;

    this.chatData.chat = {
      id: chat.id,
      userName: chat.userName,
      userAvatar: chat.userAvatar,
      online: chat.online,
      lastActive: chat.lastActive,
      displayName: chat.online ? `${chat.userName} en línea` : `${chat.userName} está escribiendo`,
      messages: this.chatData.messages[chatId] || [],
      unread: chat.unread,
      service: chat.service,
      lastMessage: chat.lastMessage,
      time: chat.time,
      userId: chat.userId
    };
  }

  backToChats() {
    this.currentChatId = null;
    this.chatData.chat = {
      id: 0,
      userName: "",
      userAvatar: "",
      online: false,
      lastActive: "",
      displayName: "",
      messages: [],
      unread: 0,
      service: "",
      lastMessage: "",
      time: "",
      userId: 0
    };
  }

}
