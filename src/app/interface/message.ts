import { Attachment } from "./attachment";

export interface Message {
    id: number;
    conversation_id: number;
    body: string | null;
    read_at: string | null;
    created_at: string;
    is_mine: boolean;
    sender: {
        id: number;
        name: string;
        avatar: string | null;
    };
    attachments: Attachment[];
}
