export interface ServiceDetail {
    budget_min: number;
    budget_max: number;
    budget_range: string | null;
    deadline: string | null;
    address: string | null;
    location: string | null;
    images: string[];
    latitude: number | null;
    longitude: number | null;
}
