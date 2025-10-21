import React from 'react';
import { PartnerDeal, ThemeSettings } from '../types';
import { QrCodeIcon } from './Icons';

interface DealsProps {
    deals: PartnerDeal[];
    onDealClick: (deal: PartnerDeal) => void;
    iconMap: { [key: string]: React.ReactNode };
    themeSettings: ThemeSettings;
}

export const PartnerDeals: React.FC<DealsProps> = ({ deals, onDealClick, iconMap, themeSettings }) => {
    return (
        <div className="w-full max-w-lg mx-auto bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Partner Offers</h2>
            <div className="space-y-3">
                {deals.map(deal => (
                    <div 
                        key={deal.id} 
                        className="flex items-center p-3 rounded-lg bg-slate-700/50 text-slate-100"
                    >
                        <div className="relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 bg-slate-600" style={{color: themeSettings.secondaryColor}}>
                            {iconMap[deal.iconName]}
                        </div>
                        <div className="flex-grow">
                            <p className="font-semibold" style={{color: themeSettings.secondaryColor}}>{deal.name}</p>
                            <p className="text-sm text-slate-400">{deal.description}</p>
                        </div>
                        <div className="relative ml-auto">
                           <button 
                             onClick={() => onDealClick(deal)}
                             className="flex items-center px-4 py-2 font-bold rounded-full shadow-lg transition-all duration-300 transform bg-slate-600 text-white hover:bg-slate-500 hover:scale-105"
                           >
                             <QrCodeIcon className="w-5 h-5 mr-2" />
                             Redeem
                           </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};