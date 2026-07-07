export const API_ENDPOINTS = {
    user: {
        name: 'auth',
        services: {
            login: 'login',
            register: 'register',
            logout: 'logout',
            refresh: 'refresh',
            me: 'me',
            reviews: 'reviews',
            users: 'users',
            changePassword: 'change-password',
            updateHasNotification: 'update-has-notification',
            account: 'account',
            forgotPassword: 'forgot-password',
            verifyOtp: 'verify-otp',
            resetPassword: 'reset-password',
        }
    },
    serviceRequests: {
        name: 'service-requests',
        services: {
            myRequests: 'my-requests',
            deliver: 'deliver',
            delivery: 'delivery',
        }
    },
    offers: {
        name: 'offers',
        services: {
            myOffers: 'my-offers',
            accept: 'accept',
        }
    },
    rides: {
        name: 'rides',
        services: {
            myRides: 'my-rides',
            join: 'join',
            passengers: 'passengers',
            confirm: 'confirm',
            start: 'start',
            pickup: 'pickup',
            dropoff: 'dropoff',
            complete: 'complete',
            cancel: 'cancel',
            rate: 'rate',
            stats: 'stats',
        }
    },
    reviews: {
        name: 'reviews',
        services: {
            users: 'users',
            like: 'like',
            helpful: 'helpful',
            report: 'report',
            reply: 'reply',
        }
    },
    publications: {
        name: 'my-publications',
        services: {
            stats: 'stats',
            summary: 'summary',
            explore: 'explore',
        }
    },
    myAssignments: {
        name: 'my-assignments',
        services: {
            services: 'services',
            rides: 'rides',
            driver: 'driver',
            passenger: 'passenger',
        }
    },
    deliveries: {
        name: 'deliveries',
        services: {
            respond: 'respond',
        }
    },
    myDeliveries: {
        name: 'my-deliveries'
    },
    pendingApprovals: {
        name: 'pending-approvals'
    },
    chat: {
        name: 'chat',
        services: {
            conversations: 'conversations',
            read: 'read',
            messages: 'messages',
            attachments: 'attachments',
            typing: 'typing',
            users: 'users',
        }
    },
    profile: {
        name: 'profile',
        services: {
            update: 'update',
        }
    },
    email: {
        name: 'email',
        services: {
            verify: 'verify',
            send: 'send',
        }
    },
    notifications: {
        name: 'auth',
        services: {
            deviceToken: 'device-token',
            subscribe: 'device-token/subscribe',
            unsubscribe: 'device-token/unsubscribe',
        }
    },
    userNotifications: {
        name: 'notifications',
        services: {
            list: '',
            unreadCount: 'unread-count',
            markAsRead: '{id}/read',
            markAllAsRead: 'read-all',
        }
    }
}