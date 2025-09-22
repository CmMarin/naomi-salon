const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL || 'https://your-backend-url.onrender.com/api'
  : 'http://localhost:3001/api';

export const api = {
  // Services
  getServices: async (language: string = 'ro') => {
    const response = await fetch(`${API_BASE_URL}/services?lang=${language}`);
    if (!response.ok) throw new Error('Failed to fetch services');
    return response.json();
  },

  // Bookings
  getBookings: async (language: string = 'ro') => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/bookings?lang=${language}`, {
      headers: token ? {
        'Authorization': `Bearer ${token}`,
      } : {},
    });
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  getOccupiedSlots: async (date?: string) => {
    const url = date 
      ? `${API_BASE_URL}/bookings/occupied-slots?date=${date}`
      : `${API_BASE_URL}/bookings/occupied-slots`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch occupied slots');
    return response.json();
  },

  getBookingsByDate: async (date: string) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/bookings/date/${date}`, {
      headers: token ? {
        'Authorization': `Bearer ${token}`,
      } : {},
    });
    if (!response.ok) throw new Error('Failed to fetch bookings for date');
    return response.json();
  },

  createBooking: async (bookingData: any) => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    if (!response.ok) {
      // Safely parse error body (may not always be JSON)
      let message = 'Failed to create booking';
      try {
        const data = await response.json();
        message = data?.error || message;
      } catch (_) {
        // fallback to status text if JSON parse fails
        message = response.statusText || message;
      }
      throw new Error(message);
    }
    return response.json();
  },

  updateBookingStatus: async (id: number, status: string) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update booking status');
    return response.json();
  },

  deleteBooking: async (id: number) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: 'DELETE',
      headers: token ? {
        'Authorization': `Bearer ${token}`,
      } : {},
    });
    if (!response.ok) throw new Error('Failed to delete booking');
    return response.json();
  },

  // Admin
  adminLogin: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    return response.json();
  },

  verifyToken: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Token verification failed');
    return response.json();
  },
};