'use client';

import { Service } from '../types';
import { formatPrice, formatDuration } from '../lib/utils';
import { useTranslation } from '../contexts/LanguageContext';

interface ServicesListProps {
  services: Service[];
  selectedService: number | null;
  onServiceSelect: (serviceId: number) => void;
}

export default function ServicesList({ services, selectedService, onServiceSelect }: ServicesListProps) {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-lg sm:text-xl font-semibold text-yellow-400">{t('services.title')}</h3>
      <div className="grid gap-3 sm:gap-4">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => onServiceSelect(service.id)}
            className={`p-4 sm:p-6 rounded-lg border text-left transition-all duration-300 ${
              selectedService === service.id
                ? 'border-yellow-400 bg-yellow-400/10 ring-2 ring-yellow-400/30 shadow-lg shadow-yellow-400/20'
                : 'border-gray-600 bg-gray-800/50 hover:border-yellow-400/50 hover:bg-yellow-400/5'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-400 text-base sm:text-lg">{service.name}</h4>
                <p className="text-gray-300 mt-1 sm:mt-2 leading-relaxed text-sm sm:text-base">{service.description}</p>
                <div className="flex items-center gap-3 sm:gap-6 mt-3 sm:mt-4 flex-wrap">
                  <span className="text-gray-400 flex items-center gap-2 text-xs sm:text-sm">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {formatDuration(service.duration)}
                  </span>
                  <span className="text-yellow-400 font-bold text-base sm:text-lg">
                    {formatPrice(service.price)}
                  </span>
                </div>
              </div>
              {selectedService === service.id && (
                <div className="text-yellow-400 ml-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}