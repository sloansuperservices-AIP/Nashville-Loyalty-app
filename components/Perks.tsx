import React from 'react';
import { Perk, ThemeSettings } from '../types';

interface PerksProps {
    currentPoints: number;
    perks: Perk[];
    iconMap: { [key: string]: React.ReactNode };
    themeSettings: ThemeSettings;
}

export const Perks: React.FC<PerksProps> = ({ currentPoints, perks, iconMap, themeSettings }) => {
    return (
        <div className="w-full max-w-lg mx-auto bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Unlocked Perks</h2>
            <div className="space-y-3">
                {perks.map(perk => {
                    const isUnlocked = currentPoints >= perk.requiredPoints;
                    const progress = Math.min((currentPoints / perk.requiredPoints) * 100, 100);

                    return (
                        <div key={perk.id} className={`relative overflow-hidden flex items-center p-3 rounded-lg transition-all duration-300 ${isUnlocked ? 'text-slate-100' : 'bg-slate-700/50 text-slate-400'}`}
                             style={{
                                 backgroundColor: isUnlocked ? `${themeSettings.primaryColor}1A` : undefined, // 1A is hex for 10% opacity
                             }}
                        >
                            <div className="absolute top-0 left-0 h-full" style={{ width: `${isUnlocked ? 100 : progress}%`, backgroundColor: `${themeSettings.primaryColor}33` }}></div>
                            <div className={`relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 ${isUnlocked ? '' : 'bg-slate-600 text-slate-400'}`}
                                 style={{
                                     backgroundColor: isUnlocked ? `${themeSettings.primaryColor}33` : undefined,
                                     color: isUnlocked ? themeSettings.primaryColor : undefined,
                                 }}
                            >
                                {iconMap[perk.iconName]}
                            </div>
                            <div className="relative">
                                <p className={`font-semibold ${isUnlocked ? '' : 'text-slate-300'}`} style={{ color: isUnlocked ? themeSettings.primaryColor : undefined }}>{perk.name}</p>
                                <p className="text-sm text-slate-400">{perk.description}</p>
                            </div>
                            <div className="relative ml-auto">
                                {isUnlocked ? (
                                    <span className="text-xs font-bold text-green-400">UNLOCKED</span>
                                ) : (
                                    <span className="text-xs font-medium text-slate-500">{currentPoints}/{perk.requiredPoints} pts</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};