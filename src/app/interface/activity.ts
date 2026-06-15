export interface Activity {
    id: string;
    type: 'completed' | 'review' | 'scheduled' | 'offer';
    title: string;
    time: string;
    icon: string;
    color: string;
    accent: string;
}
