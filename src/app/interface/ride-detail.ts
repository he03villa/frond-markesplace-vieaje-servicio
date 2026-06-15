export interface RideDetail {
    origin: string | null;
    destination: string | null;
    departure_time: string | null;
    price_per_seat: number;
    seats_available: number;
    seats_total: number;
    distance_km: number | null;
    vehicle: string;
    origin_lat: number | null;
    origin_lng: number | null;
}
