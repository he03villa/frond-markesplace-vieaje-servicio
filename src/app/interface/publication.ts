import { PublicationMeta } from "./publication-meta";
import { PublicationUser } from "./publication-user";
import { RideDetail } from "./ride-detail";
import { ServiceDetail } from "./service-detail";

export interface Publication {
    id: number;
    type: 'service' | 'ride';
    type_label: string;
    title: string;
    description: string;
    category: string;
    sub_category: string;
    status: string;
    status_label: string;
    badge: string | null;
    offers_count: number;
    views_count: number;
    published_at: string;
    user: PublicationUser;
    meta: PublicationMeta;
    detail: ServiceDetail | RideDetail | null;
}
