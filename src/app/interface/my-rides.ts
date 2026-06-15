export interface RideStats {
  upcoming: number;
  completed: number;
  cancelled: number;
  total_passengers: number;
  total_earnings: number;
  in_progress: number;
  total: number;
}

export interface RideItem {
  id: number;
  publishable_id?: number;
  origin: string;
  destination: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'in-progress';
  statusLabel: string;
  pricePerSeat: number;
  seatsTotal: number;
  seatsAvailable: number;
  vehicle: string;
  passengers: number;
  earnings: number;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
}