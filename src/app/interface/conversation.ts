export interface Conversation {
    id: number;
    contact: {
        id: number;
        name: string;
        avatar: string | null;
    };
    last_message: {
        id: number;
        body: string | null;
        is_mine: boolean;
        created_at: string;
        preview: string;
    } | null;
    unread_count: number;
    last_message_at: string | null;
}
