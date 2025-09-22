'use client';

import { useState } from 'react';
import { BookingFormData } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface BookingFormProps {
  selectedService: number | null;
  selectedDate: string | null;
  selectedTime: string | null;
  serviceName: string;
  onSubmit: (formData: BookingFormData) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

export default function BookingForm({
  selectedService,
  selectedDate,
  selectedTime,
  serviceName,
  onSubmit,
  onBack,
  isSubmitting
}: BookingFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    notes: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = t('bookingForm.nameRequired');
    }
    
    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = t('bookingForm.phoneRequired');
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.customer_phone)) {
      newErrors.customer_phone = t('bookingForm.phoneInvalid');
    }
    
    if (formData.customer_email && !/\S+@\S+\.\S+/.test(formData.customer_email)) {
      newErrors.customer_email = t('bookingForm.emailInvalid');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedService || !selectedDate || !selectedTime) {
      return;
    }

    const bookingData: BookingFormData = {
      ...formData,
      service_id: selectedService,
      appointment_date: selectedDate,
      appointment_time: selectedTime,
    };

    try {
      await onSubmit(bookingData);
    } catch (error) {
      console.error('Error submitting booking:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-yellow-400/10 text-yellow-400 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg sm:text-xl font-semibold text-yellow-400">{t('bookingForm.title')}</h3>
      </div>

      {/* Booking Summary */}
      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <h4 className="font-semibold text-yellow-400 mb-3 text-sm sm:text-base">{t('bookingForm.summary')}</h4>
        <div className="text-gray-300 space-y-1 sm:space-y-2 text-sm sm:text-base">
          <p><span className="font-medium text-yellow-400">{t('bookingForm.service')}:</span> {serviceName}</p>
          <p><span className="font-medium text-yellow-400">{t('bookingForm.date')}:</span> {selectedDate}</p>
          <p><span className="font-medium text-yellow-400">{t('bookingForm.time')}:</span> {selectedTime}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="customer_name" className="block text-sm font-semibold text-yellow-400 mb-2">
            {t('bookingForm.fullNameRequired')}
          </label>
          <input
            type="text"
            id="customer_name"
            value={formData.customer_name}
            onChange={(e) => handleInputChange('customer_name', e.target.value)}
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all ${
              errors.customer_name ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder={t('bookingForm.namePlaceholder')}
          />
          {errors.customer_name && (
            <p className="text-red-400 text-sm mt-2">{errors.customer_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="customer_phone" className="block text-sm font-semibold text-yellow-400 mb-2">
            {t('bookingForm.phoneNumberRequired')}
          </label>
          <input
            type="tel"
            id="customer_phone"
            value={formData.customer_phone}
            onChange={(e) => handleInputChange('customer_phone', e.target.value)}
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all ${
              errors.customer_phone ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder={t('bookingForm.phonePlaceholder')}
          />
          {errors.customer_phone && (
            <p className="text-red-400 text-sm mt-2">{errors.customer_phone}</p>
          )}
        </div>

        <div>
          <label htmlFor="customer_email" className="block text-sm font-semibold text-yellow-400 mb-2">
            {t('bookingForm.emailAddress')}
          </label>
          <input
            type="email"
            id="customer_email"
            value={formData.customer_email}
            onChange={(e) => handleInputChange('customer_email', e.target.value)}
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all ${
              errors.customer_email ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder={t('bookingForm.emailPlaceholder')}
          />
          {errors.customer_email && (
            <p className="text-red-400 text-sm mt-2">{errors.customer_email}</p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-semibold text-yellow-400 mb-2">
            {t('bookingForm.additionalNotes')}
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none"
            placeholder={t('bookingForm.notesPlaceholder')}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-6 py-3 border border-yellow-400/50 text-yellow-400 rounded-lg hover:bg-yellow-400/10 transition-all duration-200 font-semibold"
          >
            {t('bookingForm.back')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-lg hover:from-yellow-500 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold shadow-lg"
          >
            {isSubmitting ? t('bookingForm.bookingProgress') : t('bookingForm.bookingBtn')}
          </button>
        </div>
      </form>
    </div>
  );
}