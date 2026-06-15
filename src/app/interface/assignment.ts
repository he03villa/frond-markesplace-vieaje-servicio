export interface Assignment {
  id: string;
  type: 'service' | 'trip';
  role?: 'driver' | 'passenger'; // Solo para viajes
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  title: string;
  description: string;
  price?: number;
  createdAt: Date;

  // Campos específicos de servicio
  address?: string;
  deadline?: Date;

  // Campos específicos de viaje
  origin?: string;
  destination?: string;
  driverName?: string;
  passengersCount?: number;
  departureTime?: Date;
}