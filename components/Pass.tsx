import React from 'react';
import { User, UserRank, ThemeSettings } from '../types';

interface PassProps {
    user: User;
    ranks: UserRank[];
    rank: UserRank;
    progress: number; // 0-100
    themeSettings: ThemeSettings;
}

const GuitarPick: React.FC = () => (
    <svg width="24" height="24" viewBox="0 0 100 100" className="inline-block mr-2 fill-current">
        <path d="M50 0 L95 45 A30 30 0 0 1 5 45 Z" />
    </svg>
);

const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const capitalize = (s: string) => {
    if (typeof s !== 'string' || s.length === 0) return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}


export const Pass: React.FC<PassProps> = ({ user, ranks, rank, progress, themeSettings }) => {
    if (!user || !rank) {
        return null; // or a loading state
    }
    
    const displayName = user.email.split('@')[0];

    return (
        <div className="w-full max-w-lg mx-auto bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 text-white overflow-hidden relative border border-slate-700">
            <div style={{ backgroundColor: hexToRgba(themeSettings.primaryColor, 0.1) }} className="absolute -top-10 -right-10 w-32 h-32 rounded-full filter blur-2xl"></div>
            <div style={{ backgroundColor: hexToRgba(themeSettings.secondaryColor, 0.1) }} className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full filter blur-3xl"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <h1 className="text-2xl font-bold tracking-wider">Rockstar Pass</h1>
                    <div style={{ color: themeSettings.primaryColor }} className="font-semibold text-sm flex items-center">
                        <GuitarPick /> HALL OF FAME TOUR
                    </div>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-slate-400">Rockstar</p>
                    <p className="text-xl font-medium">{capitalize(displayName)}</p>
                </div>

                <div className="flex justify-between items-end mb-2">
                     <div>
                        <p className="text-sm text-slate-400">Current Rank</p>
                        <p style={{ color: rank.color }} className="text-lg font-bold">{rank.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-400 text-right">Tour Cash</p>
                        <p style={{ color: themeSettings.secondaryColor }} className="text-2xl font-bold">${user.points}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-700 rounded-full h-2.5 mb-4">
                    {/* Fix: Merged duplicate 'style' attributes into a single attribute to resolve the JSX error. */}
                    <div className="h-2.5 rounded-full" style={{ background: `linear-gradient(to right, ${themeSettings.primaryColor}, ${themeSettings.secondaryColor})`, width: `${progress}%` }}></div>
                </div>

                {/* Rank Roadmap */}
                <div className="mt-4">
                    <h3 className="text-sm text-slate-400 mb-2">Rank Roadmap</h3>
                    <div className="flex items-center justify-between text-xs text-center">
                        {ranks.map((r, index) => (
                            <React.Fragment key={r.name}>
                                <div className={`flex flex-col items-center ${rank.name === r.name ? '' : 'text-slate-500'}`} style={{color: rank.name === r.name ? themeSettings.primaryColor : undefined}}>
                                    <span>{r.name}</span>
                                    <span className="font-bold">{r.minPoints}</span>
                                </div>
                                {index < ranks.length - 1 && <div className="flex-1 h-px bg-slate-600 mx-2"></div>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};