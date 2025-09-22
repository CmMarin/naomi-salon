'use client';

import { useState, useEffect } from 'react';
import { Booking } from '../../types';
import { api } from '../../lib/api';
import { CalendarUtils } from '../../lib/utils';
import { useTranslation } from '../../contexts/LanguageContext';
import Link from 'next/link';
import LanguageSwitcher from '../../components/LanguageSwitcher';

export default function AdminDashboard() {
  const { t, language } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // New state for enhanced admin features
  const [currentMonth, setCurrentMonth] = useState(CalendarUtils.getToday());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // State for safer booking management
  const [editingBookings, setEditingBookings] = useState<Set<number>>(new Set());
  const [pendingChanges, setPendingChanges] = useState<{[bookingId: number]: string}>({});
  const [deletingBooking, setDeletingBooking] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      checkAuthentication();
    }
  }, [mounted]);

  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
    }
  }, [isAuthenticated, language]);

  const checkAuthentication = async () => {
    if (!mounted) return; // Only check after mounting
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      await api.verifyToken(token);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('adminToken');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const response = await api.adminLogin(loginForm.username, loginForm.password);
      localStorage.setItem('adminToken', response.token);
      setIsAuthenticated(true);
    } catch (error: any) {
      setLoginError(error.message || t('admin.login.loginFailed'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setBookings([]);
  };

  const loadBookings = async () => {
    if (!mounted) return; // Only load after mounting
    try {
      const bookingsData = await api.getBookings(language);
      // Normalize date/time: ensure YYYY-MM-DD and HH:MM strings
      const normalized = bookingsData.map((b: any) => ({
        ...b,
        appointment_date: typeof b.appointment_date === 'string' && b.appointment_date.includes('T')
          ? b.appointment_date.split('T')[0]
          : b.appointment_date,
        appointment_time: typeof b.appointment_time === 'string'
          ? b.appointment_time.slice(0, 5)
          : b.appointment_time,
      }));
      setBookings(normalized);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  // Enhanced booking management handlers
  const handleEditBooking = (bookingId: number, currentStatus: string) => {
    setEditingBookings(prev => new Set(prev).add(bookingId));
    setPendingChanges(prev => ({...prev, [bookingId]: currentStatus}));
  };

  const handleStatusChange = (bookingId: number, newStatus: string) => {
    setPendingChanges(prev => ({...prev, [bookingId]: newStatus}));
  };

  const handleSaveChanges = async (bookingId: number) => {
    const newStatus = pendingChanges[bookingId];
    if (!newStatus) return;

    try {
      await api.updateBookingStatus(bookingId, newStatus);
      await loadBookings();
      
      // Clear editing state
      setEditingBookings(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
      setPendingChanges(prev => {
        const newChanges = {...prev};
        delete newChanges[bookingId];
        return newChanges;
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handleCancelEdit = (bookingId: number) => {
    setEditingBookings(prev => {
      const newSet = new Set(prev);
      newSet.delete(bookingId);
      return newSet;
    });
    setPendingChanges(prev => {
      const newChanges = {...prev};
      delete newChanges[bookingId];
      return newChanges;
    });
  };

  const handleDeleteBooking = (bookingId: number) => {
    setDeletingBooking(bookingId);
  };

  const confirmDelete = async (bookingId: number) => {
    try {
      await api.deleteBooking(bookingId);
      await loadBookings();
      setDeletingBooking(null);
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const cancelDelete = () => {
    setDeletingBooking(null);
  };

  if (!mounted) {
    return null; // Prevent SSR/hydration mismatch
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-yellow-400">{t('admin.loading')}</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center relative px-4">
        {/* Language Switcher - Top Right */}
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>
        
        <div className="max-w-md w-full bg-gray-900/80 backdrop-blur-sm border border-yellow-400/20 rounded-lg shadow-2xl p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">{t('admin.login.title')}</h1>
            <p className="text-gray-400 mt-2 text-sm sm:text-base">{t('admin.dashboard.welcome')}</p>
          </div>

          {loginError && (
            <div className="bg-red-900/50 border border-red-500/50 rounded-md p-3 sm:p-4 mb-4">
              <p className="text-sm text-red-300">{loginError}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-yellow-400 mb-2">
                {t('admin.login.username')}
              </label>
              <input
                type="text"
                id="username"
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-yellow-400 mb-2">
                {t('admin.login.password')}
              </label>
              <input
                type="password"
                id="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold py-3 px-4 rounded-md hover:from-yellow-500 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {isLoggingIn ? t('admin.login.loggingIn') : t('admin.login.loginBtn')}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href="/" className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors">
              {t('booking.backToHome')}
            </Link>
          </div>

          <div className="text-center mt-4 text-xs text-gray-500">
            Default: admin / admin123
          </div>
        </div>
      </main>
    );
  }

  // Helper functions for the admin calendar - completely rebuilt
  const generateCalendarDays = () => {
    const calendarGrid = CalendarUtils.generateCalendarGrid(currentMonth);
    const todayString = CalendarUtils.getTodayString();
    
    return calendarGrid.map(day => {
      const dayBookings = bookingsByDate[day.dateString] || [];
      
      return {
        date: day.date,
        dateString: day.dateString,
        isCurrentMonth: day.isCurrentMonth,
        isToday: day.isToday,
        isPast: day.isPast,
        isSelected: selectedDate === day.dateString,
        bookingCount: dayBookings.length,
        hasBookings: dayBookings.length > 0,
        bookings: dayBookings,
      };
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => CalendarUtils.navigateMonth(prev, direction));
  };

  const toggleDateExpansion = (date: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filterStatus);

  // Group bookings by date
  const bookingsByDate = filteredBookings.reduce((acc, booking) => {
    if (!acc[booking.appointment_date]) {
      acc[booking.appointment_date] = [];
    }
    acc[booking.appointment_date].push(booking);
    return acc;
  }, {} as { [key: string]: Booking[] });

  const sortedDates = Object.keys(bookingsByDate).sort();
  // Get month names from translation - properly handle array
  const monthNamesTranslation = t('booking.calendar.monthNames');
  const monthNames = Array.isArray(monthNamesTranslation) ? monthNamesTranslation : [
    'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
  ];

  const calendarDays = generateCalendarDays();

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-yellow-400/20 shadow-xl">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">{t('admin.title')}</h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <LanguageSwitcher />
              <Link href="/" className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm sm:text-base">
                {t('booking.backToHome')}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-2 sm:px-6 rounded-md hover:from-yellow-500 hover:to-yellow-600 transition-all font-semibold text-sm sm:text-base w-full sm:w-auto"
              >
                {t('admin.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Enhanced Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="bg-gray-900/50 border border-yellow-400/20 rounded-lg shadow-2xl p-3 sm:p-6">
            <div className="text-lg sm:text-2xl font-bold text-yellow-400">{bookings.length}</div>
            <div className="text-gray-300 text-xs sm:text-base">{t('admin.dashboard.totalBookings')}</div>
          </div>
          <div className="bg-gray-900/50 border border-yellow-400/20 rounded-lg shadow-2xl p-3 sm:p-6">
            <div className="text-lg sm:text-2xl font-bold text-green-400">
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
            <div className="text-gray-300 text-xs sm:text-base">{t('status.confirmed')}</div>
          </div>
          <div className="bg-gray-900/50 border border-yellow-400/20 rounded-lg shadow-2xl p-3 sm:p-6">
            <div className="text-lg sm:text-2xl font-bold text-blue-400">
              {bookings.filter(b => b.status === 'completed').length}
            </div>
            <div className="text-gray-300 text-xs sm:text-base">{t('status.completed')}</div>
          </div>
          <div className="bg-gray-900/50 border border-yellow-400/20 rounded-lg shadow-2xl p-3 sm:p-6">
            <div className="text-lg sm:text-2xl font-bold text-purple-400">
              {Object.keys(bookingsByDate).length}
            </div>
            <div className="text-gray-300 text-xs sm:text-base">{t('admin.dashboard.todayBookings')}</div>
          </div>
        </div>

        {/* Calendar Overview */}
        <div className="bg-gray-900/50 border border-yellow-400/20 rounded-lg shadow-2xl">
          <div className="p-4 sm:p-6 border-b border-yellow-400/20">
            <h2 className="text-lg sm:text-xl font-semibold text-yellow-400">{t('booking.calendar.selectDate')}</h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Click on dates with bookings to view details below</p>
          </div>
          
          <div className="p-3 sm:p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-yellow-400/10 text-yellow-400 rounded transition-colors"
              >
                <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h3 className="text-base sm:text-xl md:text-2xl font-semibold text-yellow-400 text-center">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-yellow-400/10 text-yellow-400 rounded transition-colors"
              >
                <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Calendar Days of Week */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-1 sm:p-3 text-center text-xs sm:text-sm font-semibold text-gray-400">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (day.hasBookings && day.isCurrentMonth) {
                      setSelectedDate(day.dateString);
                    }
                  }}
                  disabled={!day.hasBookings || !day.isCurrentMonth}
                  className={`relative p-2 sm:p-4 h-12 sm:h-16 text-xs sm:text-sm rounded transition-all duration-200 ${
                    !day.isCurrentMonth
                      ? 'text-gray-600 bg-gray-800/30'
                      : day.hasBookings
                      ? selectedDate === day.dateString
                        ? 'bg-yellow-400 text-black font-bold shadow-lg shadow-yellow-400/30'
                        : 'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30 border border-yellow-400/50 cursor-pointer'
                      : day.isToday
                      ? 'bg-gray-700/50 text-gray-200 border border-gray-400 font-bold'
                      : 'text-gray-400 bg-gray-800/20 hover:bg-gray-700/30'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className={`text-xs sm:text-sm ${day.isToday && !day.hasBookings ? 'font-bold' : ''}`}>
                      {day.date}
                    </span>
                    {day.hasBookings && (
                      <span className={`text-xs mt-1 hidden sm:block ${
                        selectedDate === day.dateString ? 'text-black' : 'text-yellow-400'
                      }`}>
                        {day.bookingCount} {day.bookingCount === 1 ? t('admin.dashboard.booking') : t('admin.dashboard.bookings')}
                      </span>
                    )}
                    {day.hasBookings && (
                      <div className={`w-1.5 h-1.5 sm:hidden rounded-full mt-1 ${
                        selectedDate === day.dateString ? 'bg-black' : 'bg-yellow-400'
                      }`}></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <label className="text-yellow-400 font-semibold text-sm sm:text-base">{t('admin.dashboard.status')}:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-800 border border-gray-600 text-gray-300 rounded-md px-3 py-2 sm:px-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
            >
              <option value="all">{t('admin.dashboard.bookings')}</option>
              <option value="confirmed">{t('status.confirmed')}</option>
              <option value="completed">{t('status.completed')}</option>
              <option value="cancelled">{t('status.cancelled')}</option>
            </select>
          </div>
          
          {selectedDate && (
            <div className="text-gray-400 text-sm sm:text-base">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span>{t('admin.dashboard.showingBookingsFor')}:</span>
                <span className="text-yellow-400 font-semibold">
                  {CalendarUtils.parseFromDateString(selectedDate).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'ro-RO', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Bookings List */}
        <div className="bg-gray-900/50 border border-yellow-400/20 rounded-lg shadow-2xl">
          <div className="p-4 sm:p-6 border-b border-yellow-400/20">
            <h2 className="text-lg sm:text-xl font-semibold text-yellow-400">
              {t('admin.dashboard.bookings')} {selectedDate ? `${t('admin.dashboard.for')} ${CalendarUtils.parseFromDateString(selectedDate).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'ro-RO')}` : ''}
            </h2>
          </div>

          {(selectedDate ? sortedDates.filter(date => date === selectedDate) : sortedDates).length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-gray-400">
              <div className="text-yellow-400/50 mb-4">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-5 8v6m2-6v6m7-8V7a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1h14a1 1 0 001-1V9a1 1 0 00-1-1H5zm7-2v2m0 0v2" />
                </svg>
              </div>
              {selectedDate ? t('admin.dashboard.noBookingsForDate') : t('admin.dashboard.noBookings')}
            </div>
          ) : (
            <div className="divide-y divide-yellow-400/10">
              {(selectedDate ? sortedDates.filter(date => date === selectedDate) : sortedDates).map(date => (
                <div key={date} className="p-6">
                  <button
                    onClick={() => toggleDateExpansion(date)}
                    className="w-full flex items-center justify-between p-4 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors mb-4"
                  >
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-semibold text-yellow-400">
                        {CalendarUtils.parseFromDateString(date).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'ro-RO', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                      <span className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold">
                        {bookingsByDate[date].length} booking{bookingsByDate[date].length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className={`transform transition-transform ${expandedDates.has(date) ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  {expandedDates.has(date) && (
                    <div className="space-y-3 sm:space-y-4 ml-2 sm:ml-4">
                      {bookingsByDate[date]
                        .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                        .map(booking => (
                          <div key={booking.id} className="border border-yellow-400/20 bg-gray-800/30 rounded-lg p-3 sm:p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                              <div className="flex-1 w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                                  <span className="font-semibold text-yellow-400 text-base sm:text-lg">
                                    {booking.appointment_time}
                                  </span>
                                  <span className={`px-2 py-1 sm:px-3 text-xs sm:text-sm rounded-full font-semibold w-fit ${
                                    booking.status === 'confirmed' 
                                      ? 'bg-green-400/20 text-green-400 border border-green-400/30'
                                      : booking.status === 'completed'
                                      ? 'bg-blue-400/20 text-blue-400 border border-blue-400/30'
                                      : 'bg-red-400/20 text-red-400 border border-red-400/30'
                                  }`}>
                                    {t(`status.${booking.status}`)}
                                  </span>
                                </div>
                                
                                <div className="text-xs sm:text-sm text-gray-300 space-y-1 sm:space-y-2">
                                  <p><span className="font-semibold text-yellow-400">{t('admin.dashboard.service')}:</span> {booking.service_name}</p>
                                  <p><span className="font-semibold text-yellow-400">{t('admin.dashboard.customer')}:</span> {booking.customer_name}</p>
                                  <p><span className="font-semibold text-yellow-400">{t('admin.dashboard.phone')}:</span> <a href={`tel:${booking.customer_phone}`} className="text-blue-400 hover:text-blue-300">{booking.customer_phone}</a></p>
                                  {booking.customer_email && (
                                    <p><span className="font-semibold text-yellow-400">{t('admin.dashboard.email')}:</span> <a href={`mailto:${booking.customer_email}`} className="text-blue-400 hover:text-blue-300">{booking.customer_email}</a></p>
                                  )}
                                  {booking.notes && (
                                    <p><span className="font-semibold text-yellow-400">{t('admin.dashboard.notes')}:</span> {booking.notes}</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 sm:gap-3 sm:ml-6 w-full sm:w-auto justify-end">
                                {editingBookings.has(booking.id) ? (
                                  // Edit mode - show save/cancel controls
                                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                                    <select
                                      value={pendingChanges[booking.id] || booking.status}
                                      onChange={(e) => {
                                        setPendingChanges(prev => ({
                                          ...prev,
                                          [booking.id]: e.target.value
                                        }));
                                      }}
                                      className="text-xs sm:text-sm bg-yellow-500 border-2 border-yellow-400 text-black font-semibold rounded-md px-2 sm:px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                    >
                                      <option value="confirmed">{t('status.confirmed')}</option>
                                      <option value="completed">{t('status.completed')}</option>
                                      <option value="cancelled">{t('status.cancelled')}</option>
                                    </select>
                                    
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleSaveChanges(booking.id)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-xs sm:text-sm font-semibold transition-colors flex-1 sm:flex-none"
                                        title={t('admin.dashboard.save')}
                                      >
                                        <span className="hidden sm:inline">{t('admin.dashboard.save')}</span>
                                        <span className="sm:hidden">✓</span>
                                      </button>
                                      
                                      <button
                                        onClick={() => handleCancelEdit(booking.id)}
                                        className="bg-gray-600 hover:bg-gray-700 text-white px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-semibold transition-colors"
                                        title={t('admin.dashboard.cancel')}
                                      >
                                        <span className="hidden sm:inline">{t('admin.dashboard.cancel')}</span>
                                        <span className="sm:hidden">✕</span>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  // View mode - show edit/delete buttons
                                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                    <span className="text-xs sm:text-sm text-gray-400 font-medium order-1 sm:order-none">
                                      {t('admin.dashboard.status')}: <span className="text-yellow-400">{t(`status.${booking.status}`)}</span>
                                    </span>
                                    
                                    <button
                                      onClick={() => handleEditBooking(booking.id, booking.status)}
                                      className="bg-yellow-600 hover:bg-yellow-700 text-black px-3 py-2 rounded-md text-xs sm:text-sm font-semibold transition-colors order-2 sm:order-none"
                                      title={t('admin.dashboard.edit')}
                                    >
                                      {t('admin.dashboard.edit')}
                                    </button>
                                    
                                    {deletingBooking === booking.id ? (
                                      <div className="flex items-center gap-2 order-3 sm:order-none">
                                        <button
                                          onClick={() => confirmDelete(booking.id)}
                                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-xs sm:text-sm font-semibold transition-colors flex-1 sm:flex-none"
                                          title={t('admin.dashboard.confirmDelete')}
                                        >
                                          <span className="hidden sm:inline">{t('admin.dashboard.confirmDelete')}</span>
                                          <span className="sm:hidden">✓ {t('admin.dashboard.delete')}</span>
                                        </button>
                                        
                                        <button
                                          onClick={cancelDelete}
                                          className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-2 rounded-md text-xs sm:text-sm font-semibold transition-colors"
                                          title={t('admin.dashboard.cancel')}
                                        >
                                          <span className="hidden sm:inline">{t('admin.dashboard.cancel')}</span>
                                          <span className="sm:hidden">✕</span>
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setDeletingBooking(booking.id)}
                                        className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded transition-colors self-center sm:self-auto order-3 sm:order-none"
                                        title={t('admin.dashboard.deleteBooking')}
                                      >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}