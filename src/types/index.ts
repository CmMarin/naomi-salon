export interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
  description: string;
  created_at: string;
}

export interface Booking {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  service_id: number;
  service_name?: string;
  duration?: number;
  price?: number;
  appointment_date: string;
  appointment_time: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
}

export interface BookingFormData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  service_id: number;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
}