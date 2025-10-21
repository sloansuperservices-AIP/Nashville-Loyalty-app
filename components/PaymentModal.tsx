import React from 'react';
import { Vehicle, Booking, BookingType, ThemeSettings } from '../types';
import { CloseIcon, CreditCardIcon } from './Icons';

interface PaymentModalProps {
  booking: Booking;
  vehicle: Vehicle;
  onClose: () => void;
  onConfirm: (bookingId: number) => void;
  themeSettings: ThemeSettings;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ booking, vehicle, onClose, onConfirm, themeSettings }) => {
    
    const calculateTotal = () => {
        const durationHours = (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60);
        if (booking.bookingType === BookingType.QuickRide) {
            return vehicle.quickRideBaseFare.toFixed(2);
        }
        if (booking.bookingType === BookingType.Tour) {
            return (vehicle.tourHourlyRate * durationHours).toFixed(2);
        }
        return '0.00';
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleString([], {
            dateStyle: 'full',
            timeStyle: 'short'
        });
    };

    return (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <div 
            className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              aria-label="Close payment modal"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold mb-2" style={{color: themeSettings.primaryColor}}>Confirm Your Ride</h2>
            <p className="text-slate-400 mb-6">Please complete payment to finalize your booking for the <span className="font-semibold text-slate-200">{vehicle.name}</span>.</p>

            <div className="bg-slate-700/50 rounded-lg p-4 text-left space-y-2 mb-6">
                <div>
                    <p className="text-xs text-slate-400">Vehicle</p>
                    <p className="font-semibold text-slate-100">{vehicle.name}</p>
                </div>
                 <div>
                    <p className="text-xs text-slate-400">Booking Time</p>
                    <p className="font-semibold text-slate-100">{formatDate(booking.startTime)}</p>
                </div>
                 <div>
                    <p className="text-xs text-slate-400">Total</p>
                    <p className="font-bold text-lg" style={{color: themeSettings.secondaryColor}}>${calculateTotal()}</p>
                </div>
            </div>

            <div className="space-y-4">
                <a 
                    href={vehicle.stripePaymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ backgroundColor: '#635BFF' }} // Stripe's brand color
                    className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-md font-bold text-white hover:opacity-90 transition-opacity"
                >
                    <CreditCardIcon className="w-5 h-5 mr-2" />
                    Pay ${calculateTotal()} with Stripe
                </a>
                 <button
                    onClick={() => onConfirm(booking.id)}
                    style={{ backgroundColor: themeSettings.primaryColor }}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-md font-bold text-white hover:opacity-90 transition-opacity"
                >
                    I've Completed Payment
                </button>
            </div>
            <p className="text-xs text-slate-500 mt-4">Note: This is a demo. Click "I've Completed Payment" after visiting the link to confirm your booking.</p>

          </div>
        </div>
    );
};