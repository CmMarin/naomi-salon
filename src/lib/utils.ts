// Calendar utilities - all date operations use local timezone consistently
export class CalendarUtils {
  // Create a date object from year, month, day (month is 1-based)
  static createDate(year: number, month: number, day: number): Date {
    return new Date(year, month - 1, day);
  }
  
  // Format date to YYYY-MM-DD string
  static formatToDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Parse YYYY-MM-DD string to Date object
  static parseFromDateString(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return this.createDate(year, month, day);
  }
  
  // Get today as YYYY-MM-DD string
  static getTodayString(): string {
    return this.formatToDateString(new Date());
  }
  
  // Get current date object
  static getToday(): Date {
    const now = new Date();
    return this.createDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }
  
  // Check if two date strings are the same
  static isSameDate(dateString1: string, dateString2: string): boolean {
    return dateString1 === dateString2;
  }
  
  // Check if date string is today
  static isToday(dateString: string): boolean {
    return this.isSameDate(dateString, this.getTodayString());
  }
  
  // Check if date string is in the past
  static isPastDate(dateString: string): boolean {
    const today = this.getTodayString();
    return dateString < today;
  }
  
  // Get first day of month for a given date
  static getFirstDayOfMonth(date: Date): Date {
    return this.createDate(date.getFullYear(), date.getMonth() + 1, 1);
  }
  
  // Get last day of month for a given date
  static getLastDayOfMonth(date: Date): Date {
    return this.createDate(date.getFullYear(), date.getMonth() + 2, 0);
  }
  
  // Navigate to previous/next month
  static navigateMonth(date: Date, direction: 'prev' | 'next'): Date {
    const currentMonth = date.getMonth() + 1;
    const currentYear = date.getFullYear();
    
    if (direction === 'prev') {
      const newMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const newYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      return this.createDate(newYear, newMonth, 1);
    } else {
      const newMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const newYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      return this.createDate(newYear, newMonth, 1);
    }
  }
  
  // Generate calendar grid (42 days) for a given month
  static generateCalendarGrid(monthDate: Date): Array<{
    date: number;
    dateString: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    isPast: boolean;
  }> {
    const firstDay = this.getFirstDayOfMonth(monthDate);
    const currentMonth = monthDate.getMonth();
    const currentYear = monthDate.getFullYear();
    
    // Start from Sunday of the week containing the first day
    const startDate = this.createDate(currentYear, currentMonth + 1, 1 - firstDay.getDay());
    
    const days = [];
    const todayString = this.getTodayString();
    
    for (let i = 0; i < 42; i++) {
      const currentDate = this.createDate(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate() + i
      );
      
      const dateString = this.formatToDateString(currentDate);
      const isCurrentMonth = currentDate.getMonth() === currentMonth;
      const isToday = dateString === todayString;
      const isPast = this.isPastDate(dateString);
      
      days.push({
        date: currentDate.getDate(),
        dateString,
        isCurrentMonth,
        isToday,
        isPast,
      });
    }
    
    return days;
  }
}

// Backwards compatibility - keep existing function names
export const formatDate = (date: Date): string => CalendarUtils.formatToDateString(date);
export const getTodayString = (): string => CalendarUtils.getTodayString();
export const createDateFromString = (dateString: string): Date => CalendarUtils.parseFromDateString(dateString);

export const formatTime = (hour: number, minute: number = 0): string => {
  const time = new Date();
  time.setHours(hour, minute, 0, 0);
  return time.toTimeString().slice(0, 5);
};

export const formatPrice = (price: number | string): string => {
  const value = typeof price === 'number' ? price : Number.parseFloat(price);
  if (!Number.isFinite(value)) return String(price);
  return `$${value.toFixed(2)}`;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

export const generateTimeSlots = (startHour: number = 9, endHour: number = 18, interval: number = 30) => {
  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      if (hour === endHour - 1 && minute >= 60) break;
      slots.push({
        time: formatTime(hour, minute),
        display: formatTime(hour, minute),
      });
    }
  }
  return slots;
};

export const isTimeSlotAvailable = (
  timeSlot: string, 
  bookedSlots: string[], 
  serviceDuration: number = 30
): boolean => {
  // Check if the exact time slot is already booked
  if (bookedSlots.includes(timeSlot)) return false;
  
  // For more complex logic, you might want to check overlapping times
  // This is a simplified version
  return true;
};