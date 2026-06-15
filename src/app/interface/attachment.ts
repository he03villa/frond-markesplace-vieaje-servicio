export interface Attachment {
    id: number;
    type: 'image' | 'audio' | 'file';
    url: string;
    original_name: string;
    mime_type: string;
    size: number;
    human_size: string;
    width?: number;
    height?: number;
    duration_seconds?: number;
}
