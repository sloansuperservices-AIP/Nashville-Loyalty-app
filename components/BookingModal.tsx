import React, { useState, useEffect } from 'react';
import { Vehicle, BookingType, Booking, ThemeSettings } from '../types';
import { CloseIcon, SpinnerIcon } from './Icons';
import { getBookedSlots } from '../services/iCalService';

interface BookingModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onBook: (bookingDetails: Omit<Booking, 'id' | 'userId' | 'status'>) => void;
  themeSettings: ThemeSettings;
}

export const BookingModal: React.FC<BookingModalProps> = ({ vehicle, onClose, onBook, themeSettings }) => {
  const [bookingType, setBookingType] = useState<BookingType>(BookingType.QuickRide);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [hours, setHours] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Set default start time to the next hour
  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0); // Set to top of the next hour
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    
    setBookingDate(`${year}-${month}-${day}`);
    setBookingTime(`${hour}:00`);
  }, []);

  const calculateTotal = () => {
    if (bookingType === BookingType.QuickRide) {
      return vehicle.quickRideBaseFare.toFixed(2);
    }
    if (bookingType === BookingType.Tour) {
      return (vehicle.tourHourlyRate * hours).toFixed(2);
    }
    return '0.00';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!bookingDate || !bookingTime) {
      setError('Please select a valid date and time.');
      setIsLoading(false);
      return;
    }

    const start = new Date(`${bookingDate}T${bookingTime}`);
    if (isNaN(start.getTime())) {
        setError('The selected date or time is invalid.');
        setIsLoading(false);
        return;
    }
    if (start < new Date()) {
      setError('Booking time cannot be in the past.');
      setIsLoading(false);
      return;
    }

    const durationMinutes = bookingType === BookingType.QuickRide ? 60 : hours * 60;
    const end = new Date(start.getTime() + durationMinutes * 60000);

    // Simulate checking iCal availability
    try {
        const bookedSlots = await getBookedSlots(vehicle.iCalUrl);
        const isConflict = bookedSlots.some(slot => 
            (start < slot.end && end > slot.start)
        );

        if (isConflict) {
            setError('This time slot is unavailable. Please choose another time.');
            setIsLoading(false);
            return;
        }

        onBook({
            vehicleId: vehicle.id,
            bookingType,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
        });

    } catch (err) {
        console.error("Error checking availability:", err);
        setError("Could not verify availability. Please try again later.");
        setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Close booking modal"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold mb-1" style={{color: themeSettings.primaryColor}}>{vehicle.name}</h2>
        <p className="text-slate-400 mb-6">Complete your booking details below.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Booking Type</label>
                <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setBookingType(BookingType.QuickRide)} className={`p-3 rounded-md text-sm font-semibold transition-colors ${bookingType === BookingType.QuickRide ? 'text-white' : 'bg-slate-700 text-slate-300'}`} style={{backgroundColor: bookingType === BookingType.QuickRide ? themeSettings.primaryColor : undefined}}>Quick Ride</button>
                    <button type="button" onClick={() => setBookingType(BookingType.Tour)} className={`p-3 rounded-md text-sm font-semibold transition-colors ${bookingType === BookingType.Tour ? 'text-white' : 'bg-slate-700 text-slate-300'}`} style={{backgroundColor: bookingType === BookingType.Tour ? themeSettings.primaryColor : undefined}}>Tour</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="bookingDate" className="block text-sm font-medium text-slate-300">Date</label>
                    <input type="date" id="bookingDate" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" required />
                </div>
                 <div>
                    <label htmlFor="bookingTime" className="block text-sm font-medium text-slate-300">Time</label>
                    <input type="time" id="bookingTime" value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" required />
                </div>
            </div>
            
            {bookingType === BookingType.Tour && (
                 <div>
                    <label htmlFor="hours" className="block text-sm font-medium text-slate-300">Duration (hours)</label>
                    <input type="number" id="hours" value={hours} onChange={e => setHours(Math.max(1, parseInt(e.target.value, 10)))} min="1" className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" required />
                </div>
            )}

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <div className="pt-4 flex justify-between items-center">
                <div>
                    <p className="text-sm text-slate-400">Estimated Total</p>
                    <p className="text-2xl font-bold" style={{color: themeSettings.secondaryColor}}>${calculateTotal()}</p>
                </div>
                <button 
                    type="submit" 
                    disabled={isLoading}
                    style={{ backgroundColor: themeSettings.primaryColor }}
                    className="px-8 py-3 font-bold text-white rounded-full shadow-lg transition-all duration-300 transform hover:opacity-90 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center"
                >
                    {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2" /> Checking...</> : 'Proceed to Payment'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};