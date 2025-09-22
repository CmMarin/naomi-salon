'use client';

import { useState } from 'react';
import { CalendarUtils, generateTimeSlots, isTimeSlotAvailable } from '../lib/utils';
import { Booking } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface CalendarProps {
  selectedDate: string | null;
  selectedTime: string | null;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
  bookedSlots: Booking[];
  serviceDuration?: number;
}

export default function Calendar({ 
  selectedDate, 
  selectedTime, 
  onDateSelect, 
  onTimeSelect,
  bookedSlots,
  serviceDuration = 30
}: CalendarProps) {
  const { t, language } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(CalendarUtils.getToday());
  const timeSlots = generateTimeSlots();
  
  // Generate calendar days using the new utility
  const calendarDays = CalendarUtils.generateCalendarGrid(currentMonth);
  
  // Get booked times for selected date
  const bookedTimes = selectedDate 
    ? bookedSlots
        .filter(booking => booking.appointment_date === selectedDate)
        .map(booking => booking.appointment_time)
    : [];

  // Month and day names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get translated month names
  const getTranslatedMonthNames = () => {
    const monthKeys = t('booking.calendar.monthNames');
    if (Array.isArray(monthKeys)) {
      return monthKeys;
    }
    return monthNames; // fallback to English
  };

  // Get translated day names
  const getTranslatedDayNames = () => {
    const dayKeys = t('booking.calendar.dayNames');
    if (Array.isArray(dayKeys)) {
      return dayKeys;
    }
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // fallback to English
  };

  const translatedMonthNames = getTranslatedMonthNames();
  const translatedDayNames = getTranslatedDayNames();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => CalendarUtils.navigateMonth(prev, direction));
  };

  const handleDateSelect = (dateString: string, isPast: boolean, isCurrentMonth: boolean) => {
    if (isPast || !isCurrentMonth) return;
    onDateSelect(dateString);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-yellow-400">{t('booking.calendar.selectDate')}</h3>
      
      {/* Calendar */}
      <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-yellow-400/10 text-yellow-400 rounded transition-colors"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h4 className="text-lg sm:text-xl font-semibold text-yellow-400 text-center">
            {translatedMonthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h4>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-yellow-400/10 text-yellow-400 rounded transition-colors"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
          {translatedDayNames.map((day, index) => (
            <div key={index} className="p-2 sm:p-3 text-center text-xs sm:text-sm font-semibold text-gray-400">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((day, index) => {
            const isSelected = selectedDate === day.dateString;
            
            return (
              <button
                key={index}
                onClick={() => handleDateSelect(day.dateString, day.isPast, day.isCurrentMonth)}
                disabled={day.isPast || !day.isCurrentMonth}
                className={`p-2 sm:p-3 text-xs sm:text-sm h-10 sm:h-12 rounded transition-all duration-200 ${
                  !day.isCurrentMonth
                    ? 'text-gray-600'
                    : day.isPast
                    ? 'text-gray-600 cursor-not-allowed'
                    : isSelected
                    ? 'bg-yellow-400 text-black font-bold shadow-lg shadow-yellow-400/30'
                    : day.isToday
                    ? 'bg-yellow-400/20 text-yellow-400 font-bold border border-yellow-400/50'
                    : 'hover:bg-yellow-400/10 text-gray-300 hover:text-yellow-400'
                }`}
              >
                {day.date}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 sm:p-6">
          <h4 className="text-base sm:text-lg font-semibold text-yellow-400 mb-3 sm:mb-4">{t('booking.calendar.selectTime')}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
            {timeSlots.map(slot => {
              const isAvailable = isTimeSlotAvailable(slot.time, bookedTimes, serviceDuration);
              const isSelected = selectedTime === slot.time;
              
              return (
                <button
                  key={slot.time}
                  onClick={() => isAvailable && onTimeSelect(slot.time)}
                  disabled={!isAvailable}
                  className={`p-2 sm:p-3 text-xs sm:text-sm rounded transition-all duration-200 ${
                    !isAvailable
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : isSelected
                      ? 'bg-yellow-400 text-black font-bold shadow-lg shadow-yellow-400/30'
                      : 'bg-gray-700 text-gray-300 hover:bg-yellow-400/20 hover:text-yellow-400 border border-gray-600 hover:border-yellow-400/50'
                  }`}
                >
                  {slot.display}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}