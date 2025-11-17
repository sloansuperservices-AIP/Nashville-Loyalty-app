import React, { useState } from 'react';
import { PartnerInfo } from '../types';
import { CloseIcon } from './Icons';

interface PartnerPortalProps {
    partnerInfo: PartnerInfo | undefined;
    onSave: (info: PartnerInfo) => void;
    onExit: () => void;
}

export const PartnerPortal: React.FC<PartnerPortalProps> = ({ partnerInfo, onSave, onExit }) => {
    const [formData, setFormData] = useState<Omit<PartnerInfo, 'userId'>>({
        kpis: partnerInfo?.kpis || '',
        vipDeal: partnerInfo?.vipDeal || '',
        challenges: partnerInfo?.challenges || '',
        perks: partnerInfo?.perks || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, userId: partnerInfo?.userId || 0 });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-100">Partner Portal</h1>
                    <button onClick={onExit} className="text-slate-400 hover:text-white">
                        <CloseIcon className="w-8 h-8" />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="kpis" className="block text-sm font-medium text-slate-300">Key Performance Indicators (KPIs)</label>
                        <textarea
                            id="kpis"
                            name="kpis"
                            value={formData.kpis}
                            onChange={handleChange}
                            rows={4}
                            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            placeholder="e.g., Increase foot traffic by 20% on weekdays."
                        />
                    </div>
                    <div>
                        <label htmlFor="vipDeal" className="block text-sm font-medium text-slate-300">AIP VIP Deal</label>
                        <textarea
                            id="vipDeal"
                            name="vipDeal"
                            value={formData.vipDeal}
                            onChange={handleChange}
                            rows={4}
                            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            placeholder="e.g., Exclusive access to our rooftop lounge with a complimentary drink."
                        />
                    </div>
                    <div>
                        <label htmlFor="challenges" className="block text-sm font-medium text-slate-300">Desired Challenges</label>
                        <textarea
                            id="challenges"
                            name="challenges"
                            value={formData.challenges}
                            onChange={handleChange}
                            rows={4}
                            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            placeholder="e.g., A photo challenge in front of our mural, a receipt challenge for spending over $50."
                        />
                    </div>
                    <div>
                        <label htmlFor="perks" className="block text-sm font-medium text-slate-300">Extra Perks for Challenge Completion</label>
                        <textarea
                            id="perks"
                            name="perks"
                            value={formData.perks}
                            onChange={handleChange}
                            rows={4}
                            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            placeholder="e.g., A free appetizer or 15% off their next purchase."
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-md hover:bg-purple-500 transition-colors">
                            Save Information
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
