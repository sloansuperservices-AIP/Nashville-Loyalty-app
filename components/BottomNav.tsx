import React from 'react';
import { ThemeSettings } from '../types';
import { MapPinIcon, CameraIcon } from './Icons';
import { CarIcon, DealsIcon, TrophyIcon } from './NewIcons';

interface BottomNavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    themeSettings: ThemeSettings;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, themeSettings }) => {
    
    const navItems = [
        { id: 'map', label: 'Map', icon: <MapPinIcon className="w-6 h-6" /> },
        { id: 'challenges', label: 'Challenges', icon: <CameraIcon className="w-6 h-6" /> },
        { id: 'pass', label: 'My Pass', icon: <TrophyIcon className="w-6 h-6" /> },
        { id: 'deals', label: 'Deals', icon: <DealsIcon className="w-6 h-6" /> },
        { id: 'rides', label: 'Rides', icon: <CarIcon className="w-6 h-6" /> },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm border-t border-slate-700 z-50">
            <div className="max-w-4xl mx-auto flex justify-around">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
                            activeTab === item.id ? '' : 'text-slate-400 hover:text-white'
                        }`}
                        style={{ color: activeTab === item.id ? themeSettings.primaryColor : undefined }}
                        aria-label={item.label}
                    >
                        {item.icon}
                        <span className="text-xs mt-1">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};
