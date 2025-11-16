import React from 'react';
import { User, UserRank, ThemeSettings } from '../types';
import { TrophyIcon, CashIcon } from './NewIcons';

export const StatusBar: React.FC<{ user: User, rank: UserRank, themeSettings: ThemeSettings }> = ({ user, rank, themeSettings }) => {
    return (
        <div className="w-full bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 flex justify-around items-center p-3">
            <div className="flex items-center space-x-3">
                <CashIcon className="w-8 h-8" style={{ color: themeSettings.secondaryColor }} />
                <div>
                    <p className="text-xs text-slate-400">Tour Cash</p>
                    <p style={{ color: themeSettings.secondaryColor }} className="text-xl font-bold">${user.points}</p>
                </div>
            </div>
            <div className="h-10 w-px bg-slate-600"></div>
            <div className="flex items-center space-x-3">
                <TrophyIcon className="w-8 h-8" style={{ color: rank.color }} />
                <div>
                    <p className="text-xs text-slate-400">Rank</p>
                    <p style={{ color: rank.color }} className="text-xl font-bold">{rank.name}</p>
                </div>
            </div>
        </div>
    );
};