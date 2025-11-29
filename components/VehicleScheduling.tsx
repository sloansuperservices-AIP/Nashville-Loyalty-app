import React from 'react';
import { Vehicle, ThemeSettings } from '../types';
import { UsersIcon } from './Icons';

interface VehicleSchedulingProps {
    vehicles: Vehicle[];
    onBook: (vehicle: Vehicle) => void;
    themeSettings: ThemeSettings;
}

// Vintage Theme Colors just for this component
const VINTAGE_GOLD = '#d4af37';
const VINTAGE_FONT = "'Lora', serif";

const VehicleCard: React.FC<{ vehicle: Vehicle; onBook: (vehicle: Vehicle) => void; }> = ({ vehicle, onBook }) => {
    return (
        <div className="bg-slate-800 rounded-lg overflow-hidden flex flex-col md:flex-row shadow-lg border border-slate-700">
            <img src={vehicle.imageUrl} alt={vehicle.name} className="w-full md:w-48 h-48 object-cover" />
            <div className="p-4 flex flex-col flex-grow relative">
                 {/* Vintage decorative border accent on top of card content */}
                <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: VINTAGE_GOLD }}></div>
                
                <h3 className="text-xl font-bold text-slate-100" style={{ fontFamily: VINTAGE_FONT }}>{vehicle.name}</h3>
                <p className="text-sm text-slate-400 mt-2 flex-grow leading-relaxed italic">{vehicle.description}</p>
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
                    <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center text-slate-300"><UsersIcon className="w-4 h-4 mr-1.5" /> Seats {vehicle.capacity}</span>
                        <div className="flex flex-col">
                             <span className="font-semibold text-slate-200">${vehicle.quickRideBaseFare} / Ride</span>
                             <span className="font-semibold text-slate-200">${vehicle.tourHourlyRate} / Hour</span>
                        </div>
                    </div>
                     <button 
                        onClick={() => onBook(vehicle)}
                        style={{ backgroundColor: VINTAGE_GOLD, fontFamily: VINTAGE_FONT }}
                        className="w-full sm:w-auto px-6 py-2 font-bold text-slate-900 rounded-sm hover:bg-yellow-600 transition-colors uppercase tracking-widest text-xs"
                    >
                        Reserve
                    </button>
                </div>
            </div>
        </div>
    );
};


export const VehicleScheduling: React.FC<VehicleSchedulingProps> = ({ vehicles, onBook }) => {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8 relative py-4">
                 <div className="absolute top-1/2 left-0 w-full h-px bg-slate-700 -z-10"></div>
                 <span className="bg-slate-900 px-6 text-2xl font-bold text-transparent bg-clip-text" style={{ 
                     fontFamily: VINTAGE_FONT, 
                     backgroundImage: `linear-gradient(to right, ${VINTAGE_GOLD}, #f59e0b)` 
                 }}>
                     Vintage Auto Tours
                 </span>
            </div>
            
            <div className="space-y-6">
                {vehicles.map(vehicle => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} onBook={onBook} />
                ))}
            </div>
            
            <div className="flex justify-center mt-8">
                 <p className="text-xs text-slate-500 italic" style={{ fontFamily: VINTAGE_FONT }}>
                     "Timeless Rides for a Legendary City"
                 </p>
            </div>
        </div>
    );
};