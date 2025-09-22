'use client';

import { useState, useEffect } from 'react';
import { Service, Booking, BookingFormData } from '../types';
import { api } from '../lib/api';
import { useTranslation } from '../contexts/LanguageContext';
import ServicesList from '../components/ServicesList';
import Calendar from '../components/Calendar';
import BookingForm from '../components/BookingForm';
import LanguageSwitcher from '../components/LanguageSwitcher';

type AppScreen = 'welcome' | 'booking';
type BookingStep = 'calendar' | 'services' | 'form' | 'confirmation';

export default function Home() {
  const { t, language } = useTranslation();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [currentStep, setCurrentStep] = useState<BookingStep>('calendar');
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadServices();
      loadBookings();
    }
  }, [mounted, language]); // Reload services when language changes

  const loadServices = async () => {
    if (!mounted) return;
    try {
      const servicesData = await api.getServices(language);
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading services:', error);
      setError('Failed to load services');
    }
  };

  const loadBookings = async () => {
    if (!mounted) return;
    try {
      const occupiedSlots = await api.getOccupiedSlots();
      // Transform occupied slots to booking format for calendar
      const bookingsData = occupiedSlots.map((slot: any) => ({
        appointment_date: slot.appointment_date,
        appointment_time: slot.appointment_time,
      }));
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading occupied slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceSelect = (serviceId: number) => {
    setSelectedService(serviceId);
    setCurrentStep('form');
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleBookingSubmit = async (formData: BookingFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const newBooking = await api.createBooking(formData);
      setConfirmedBooking(newBooking);
      setCurrentStep('confirmation');
      await loadBookings();
    } catch (error: any) {
      setError(error.message || 'Failed to create booking');
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startBookingFlow = () => {
    setCurrentScreen('booking');
    setCurrentStep('calendar');
  };

  const backToWelcome = () => {
    setCurrentScreen('welcome');
    setCurrentStep('calendar');
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setConfirmedBooking(null);
    setError(null);
  };

  const resetBooking = () => {
    setCurrentStep('calendar');
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setConfirmedBooking(null);
    setError(null);
  };

  const getSelectedService = () => {
    return services.find(service => service.id === selectedService);
  };

  const canProceedToServices = selectedDate && selectedTime;

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-yellow-400">{t('common.loading')}</p>
        </div>
      </main>
    );
  }

  if (currentScreen === 'welcome') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center relative overflow-x-hidden">
        {/* Language Switcher - Top Right */}
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>
        
        <div className="text-center max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Logo/Brand */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-3 sm:mb-4 leading-tight">
              <span className="cursive-naomi">{t('welcome.title')}</span>
            </h1>
            <div className="h-1 w-20 sm:w-32 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-3 sm:mb-4"></div>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 font-light tracking-wider">
              {t('welcome.subtitle')}
            </p>
          </div>

          {/* Tagline */}
          <div className="mb-8 sm:mb-12">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
              {t('welcome.tagline')}<br />
              {t('welcome.taglineSubtext')}
            </p>
          </div>

          {/* CTA Button */}
          <div className="mb-8 sm:mb-12">
            <button
              onClick={startBookingFlow}
              className="group relative inline-flex items-center justify-center px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl font-semibold text-black bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-300 hover:from-yellow-500 hover:to-yellow-600 hover:scale-105 shadow-2xl hover:shadow-yellow-500/25 w-full sm:w-auto"
            >
              <span className="relative z-10">{t('welcome.bookAppointmentBtn')}</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
            </button>
          </div>

          {/* Contact Phone */}
          <div className="mb-8 sm:mb-12">
            <p className="text-gray-400 text-sm sm:text-base mb-2">{t('welcome.contactForQuestions')}</p>
            <a 
              href="tel:+40123456789" 
              className="text-yellow-400 hover:text-yellow-300 transition-colors text-lg sm:text-xl font-semibold"
            >
              📞 +40 123 456 789
            </a>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <div className="text-center p-4 bg-gray-900/30 backdrop-blur-sm border border-yellow-400/20 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-yellow-400 mb-2">{t('welcome.features.expertStylists.title')}</h3>
              <p className="text-gray-400 text-xs sm:text-sm">{t('welcome.features.expertStylists.description')}</p>
            </div>
            
            <div className="text-center p-4 bg-gray-900/30 backdrop-blur-sm border border-yellow-400/20 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-yellow-400 mb-2">{t('welcome.features.easyBooking.title')}</h3>
              <p className="text-gray-400 text-xs sm:text-sm">{t('welcome.features.easyBooking.description')}</p>
            </div>
            
            <div className="text-center p-4 bg-gray-900/30 backdrop-blur-sm border border-yellow-400/20 rounded-lg sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-yellow-400 mb-2">{t('welcome.features.premiumService.title')}</h3>
              <p className="text-gray-400 text-xs sm:text-sm">{t('welcome.features.premiumService.description')}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <button 
            onClick={backToWelcome}
            className="mb-4 sm:mb-6 text-yellow-400 hover:text-yellow-300 transition duration-200 flex items-center gap-2 mx-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('booking.backToHome')}
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2 sm:mb-4">
            {t('booking.title')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300">
            {t('booking.subtitle')}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-4 sm:mb-6 bg-red-900/50 border border-red-500/50 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-2xl mx-auto bg-gray-900/80 backdrop-blur-sm border border-yellow-400/20 rounded-lg shadow-2xl p-4 sm:p-6">
          {currentStep === 'calendar' && (
            <div className="space-y-4 sm:space-y-6">
              <Calendar
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onDateSelect={handleDateSelect}
                onTimeSelect={handleTimeSelect}
                bookedSlots={bookings}
                serviceDuration={45} // Default duration for calendar display
              />
              
              {canProceedToServices && (
                <button
                  onClick={() => setCurrentStep('services')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-md hover:from-yellow-500 hover:to-yellow-600 transition duration-200 text-base sm:text-lg"
                >
                  {t('booking.chooseService')}
                </button>
              )}
            </div>
          )}

          {currentStep === 'services' && canProceedToServices && (
            <div className="space-y-4 sm:space-y-6">
              <ServicesList
                services={services}
                selectedService={selectedService}
                onServiceSelect={handleServiceSelect}
              />
              
              <button
                onClick={() => setCurrentStep('calendar')}
                className="w-full px-4 py-2 border border-yellow-400/50 text-yellow-400 rounded-md hover:bg-yellow-400/10 transition duration-200"
              >
                {t('booking.backToCalendar')}
              </button>
            </div>
          )}

          {currentStep === 'form' && selectedService && canProceedToServices && (
            <BookingForm
              selectedService={selectedService}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              serviceName={getSelectedService()?.name || ''}
              onSubmit={handleBookingSubmit}
              onBack={() => setCurrentStep('services')}
              isSubmitting={isSubmitting}
            />
          )}

          {currentStep === 'confirmation' && confirmedBooking && (
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="text-yellow-400">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-yellow-400">{t('confirmation.title')}</h3>
              
              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4 sm:p-6 text-left">
                <h4 className="font-semibold text-yellow-400 mb-3 text-center sm:text-left">{t('confirmation.details')}</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><span className="font-medium text-yellow-400">{t('confirmation.service')}:</span> {confirmedBooking.service_name}</p>
                  <p><span className="font-medium text-yellow-400">{t('confirmation.date')}:</span> {confirmedBooking.appointment_date}</p>
                  <p><span className="font-medium text-yellow-400">{t('confirmation.time')}:</span> {confirmedBooking.appointment_time}</p>
                  <p><span className="font-medium text-yellow-400">{t('confirmation.customer')}:</span> {confirmedBooking.customer_name}</p>
                  <p><span className="font-medium text-yellow-400">{t('confirmation.phone')}:</span> {confirmedBooking.customer_phone}</p>
                  {confirmedBooking.customer_email && (
                    <p><span className="font-medium text-yellow-400">{t('confirmation.email')}:</span> {confirmedBooking.customer_email}</p>
                  )}
                </div>
              </div>
              
              {confirmedBooking.customer_email && (
                <div className="bg-blue-400/10 border border-blue-400/30 rounded-lg p-4 text-center">
                  <div className="text-blue-400 mb-2">
                    <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-blue-400 text-sm">
                    📧 Email de confirmare va fi trimis la <br/>
                    <span className="font-bold">{confirmedBooking.customer_email}</span><br/>
                    <span className="text-xs text-gray-400">(dacă este configurat email-ul)</span>
                  </p>
                </div>
              )}
              
              <p className="text-gray-300 text-sm sm:text-base">
                {t('confirmation.confirmationText')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={resetBooking}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-6 py-2 rounded-md hover:from-yellow-500 hover:to-yellow-600 transition duration-200 font-semibold"
                >
                  {t('confirmation.bookAnother')}
                </button>
                <button
                  onClick={backToWelcome}
                  className="flex-1 border border-yellow-400/50 text-yellow-400 px-6 py-2 rounded-md hover:bg-yellow-400/10 transition duration-200"
                >
                  {t('confirmation.backToHome')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}