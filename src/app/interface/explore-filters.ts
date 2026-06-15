export interface ExploreFilters {
    search: string;
    category: string | null;
    sort: string | null;
    type: string | null;
    max_distance: number | null;
    max_price: number | null;
    availability: string | null;
    page: number;
    lat: number | null;
    lng: number | null;
}
