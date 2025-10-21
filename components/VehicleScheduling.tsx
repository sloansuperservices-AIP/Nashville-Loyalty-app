import React from 'react';
import { Vehicle, ThemeSettings } from '../types';
import { UsersIcon } from './Icons';

interface VehicleSchedulingProps {
    vehicles: Vehicle[];
    onBook: (vehicle: Vehicle) => void;
    themeSettings: ThemeSettings;
}

const VehicleCard: React.FC<{ vehicle: Vehicle; onBook: (vehicle: Vehicle) => void; themeSettings: ThemeSettings }> = ({ vehicle, onBook, themeSettings }) => {
    return (
        <div className="bg-slate-700/50 rounded-lg overflow-hidden flex flex-col md:flex-row transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
            <img src={vehicle.imageUrl} alt={vehicle.name} className="w-full md:w-48 h-40 object-cover" />
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-slate-100">{vehicle.name}</h3>
                <p className="text-sm text-slate-400 mt-1 flex-grow">{vehicle.description}</p>
                <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center text-slate-300"><UsersIcon className="w-4 h-4 mr-1.5" /> Seats {vehicle.capacity}</span>
                        <span className="font-semibold" style={{color: themeSettings.secondaryColor}}>${vehicle.quickRideBaseFare} / Ride</span>
                         <span className="font-semibold" style={{color: themeSettings.secondaryColor}}>${vehicle.tourHourlyRate} / Hour</span>
                    </div>
                     <button 
                        onClick={() => onBook(vehicle)}
                        style={{ backgroundColor: themeSettings.primaryColor }}
                        className="px-6 py-2 font-bold text-white rounded-full shadow-lg transition-all duration-300 transform hover:opacity-90"
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
};


export const VehicleScheduling: React.FC<VehicleSchedulingProps> = ({ vehicles, onBook, themeSettings }) => {
    return (
        <div className="w-full max-w-4xl mx-auto bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Rockstar Rides</h2>
            <div className="space-y-4">
                {vehicles.map(vehicle => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} onBook={onBook} themeSettings={themeSettings} />
                ))}
            </div>
        </div>
    );
};