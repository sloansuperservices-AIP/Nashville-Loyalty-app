import React from 'react';
import { Booking, Vehicle, ThemeSettings } from '../types';
import { CalendarDaysIcon } from './Icons';
import { generateAndDownloadICS } from '../services/iCalService';

interface MyBookingsProps {
    bookings: Booking[];
    vehicles: Vehicle[];
    themeSettings: ThemeSettings;
}

export const MyBookings: React.FC<MyBookingsProps> = ({ bookings, vehicles, themeSettings }) => {
    
    const sortedBookings = [...bookings].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleString([], {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-slate-100 mb-4">My Bookings</h2>
            {sortedBookings.length === 0 ? (
                 <p className="text-slate-400 text-center py-4">You have no upcoming rides.</p>
            ) : (
                <div className="space-y-3">
                    {sortedBookings.map(booking => {
                        const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                        if (!vehicle) return null;

                        return (
                            <div key={booking.id} className="p-3 rounded-lg bg-slate-700/50 flex items-center justify-between">
                                <div className="flex items-center">
                                    <img src={vehicle.imageUrl} alt={vehicle.name} className="w-16 h-10 object-cover rounded-md mr-4" />
                                    <div>
                                        <p className="font-semibold text-slate-100">{vehicle.name}</p>
                                        <p className="text-xs text-slate-400">{booking.bookingType.replace('_', ' ')}: {formatDate(booking.startTime)}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => generateAndDownloadICS(booking, vehicle)}
                                    className="flex items-center text-sm px-4 py-2 font-semibold rounded-full shadow-lg transition-all duration-300 transform bg-slate-600 text-white hover:bg-slate-500 hover:scale-105"
                                >
                                    <CalendarDaysIcon className="w-4 h-4 mr-2" />
                                    Add to Calendar
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};