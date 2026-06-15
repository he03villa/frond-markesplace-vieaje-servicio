export interface ServiceStats {
  active: number;
  completed: number;
  paused: number;
  total_earnings: number;
  total_views: number;
  totalOffers: number;
  total: number;
}

export interface ServiceItem {
  id: number;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'completed' | 'paused' | 'pending';
  status_label: string;
  price: string;
  price_range: string;
  image: string;
  views: number;
  offers: number;
  created_at: string;
  relative_time: string;
  location: string;
  has_images: boolean;
  rating?: number;
  deadline?: string;
  publishable_id: number;
}