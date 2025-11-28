import React, { useState } from 'react';
import { Challenge, ChallengeType, Perk, User, Role, PartnerDeal, ThemeSettings, Vehicle } from '../types';
import { CloseIcon, CogIcon, PencilIcon, PlusCircleIcon, TrashIcon, LogoutIcon, UsersIcon, QrCodeIcon, ChartBarIcon, PaintBrushIcon, KeyIcon } from './Icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

interface AdminPanelProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    challenges: Challenge[];
    setChallenges: React.Dispatch<React.SetStateAction<Challenge[]>>;
    perks: Perk[];
    setPerks: React.Dispatch<React.SetStateAction<Perk[]>>;
    deals: PartnerDeal[];
    setDeals: React.Dispatch<React.SetStateAction<PartnerDeal[]>>;
    vehicles: Vehicle[];
    setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
    themeSettings: ThemeSettings;
    setThemeSettings: React.Dispatch<React.SetStateAction<ThemeSettings>>;
    onExit: () => void;
    onLogout: () => void;
    iconMap: { [key: string]: React.ReactNode };
}

const challengeIconOptions = ['MapPin', 'Camera', 'VideoCamera', 'Receipt', 'AtSymbol', 'CalendarDays', 'ViewfinderCircle'];
const perkAndDealIconOptions = ['MusicNote', 'Ticket', 'Gift', 'Crown', 'QrCode'];

const resizeImage = (file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    } else {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality));
                } else {
                     reject(new Error("Canvas context is null"));
                }
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ users, setUsers, challenges, setChallenges, perks, setPerks, deals, setDeals, vehicles, setVehicles, themeSettings, setThemeSettings, onExit, onLogout, iconMap }) => {
    const [activeTab, setActiveTab] = useState('analytics');
    const [editingItem, setEditingItem] = useState<Challenge | Perk | User | PartnerDeal | Vehicle | Record<string, never> | null>(null);
    const [formState, setFormState] = useState<any>({});
    
    const openForm = (item?: Challenge | Perk | User | PartnerDeal | Vehicle) => {
        setEditingItem(item || {});
        setFormState(item || {});
    };

    const closeForm = () => {
        setEditingItem(null);
        setFormState({});
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const targetType = (e.target as HTMLInputElement).type;

        if (targetType === 'number') {
             // Allow empty string for clearing the field, otherwise convert to number
            setFormState((prev: any) => ({ ...prev, [name]: value === '' ? '' : parseFloat(value) }));
        } else {
            setFormState((prev: any) => ({ ...prev, [name]: value }));
        }
    };

    const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setThemeSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleBgImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const base64 = await resizeImage(file, 800, 600, 0.5); // Optimized size for background
                setThemeSettings(prev => ({ ...prev, backgroundImage: base64 }));
            } catch (error) {
                console.error("Error resizing image:", error);
                alert("Failed to process image.");
            }
        }
    };

    const handleVehicleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const base64 = await resizeImage(file, 500, 375, 0.5); // Optimized size for vehicles
                setFormState((prev: any) => ({ ...prev, imageUrl: base64 }));
            } catch (error) {
                console.error("Error resizing image:", error);
                alert("Failed to process image.");
            }
        }
    };


    const removeBgImage = () => {
        setThemeSettings(prev => ({ ...prev, backgroundImage: '' }));
    };
    
    const handleChallengeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const challengeData = { ...formState };
        
        if (editingItem && 'id' in editingItem) { // Update
            setChallenges(challenges.map(c => c.id === challengeData.id ? challengeData : c));
        } else { // Create
            challengeData.id = Date.now();
            setChallenges([...challenges, challengeData]);
        }
        closeForm();
    };

    const handlePerkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const perkData = { ...formState };

        if (editingItem && 'id' in editingItem) { // Update
            setPerks(perks.map(p => p.id === perkData.id ? perkData : p));
        } else { // Create
            perkData.id = Date.now();
            setPerks([...perks, perkData]);
        }
        closeForm();
    };

    const handleDealSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dealData = { ...formState };

        if (editingItem && 'id' in editingItem) { // Update
            setDeals(deals.map(d => d.id === dealData.id ? dealData : d));
        } else { // Create
            dealData.id = Date.now();
            dealData.scanCount = dealData.scanCount || 0;
            setDeals([...deals, dealData]);
        }
        closeForm();
    };

    const handleUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const userData = { ...formState };
        if (editingItem && 'id' in editingItem) { // Update
            setUsers(users.map(u => u.id === userData.id ? { ...u, ...userData } : u));
        } else { // Create
            userData.id = Date.now();
            userData.points = 0;
            userData.completedChallengeIds = new Set();
            setUsers([...users, userData]);
        }
        closeForm();
    };

    const handleVehicleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const vehicleData = { ...formState };
        
        if (!vehicleData.imageUrl) {
            alert("Please upload an image for the vehicle.");
            return;
        }

        if (editingItem && 'id' in editingItem) { // Update
            setVehicles(vehicles.map(v => v.id === vehicleData.id ? vehicleData : v));
        } else { // Create
            vehicleData.id = Date.now();
            setVehicles([...vehicles, vehicleData]);
        }
        closeForm();
    };


    const renderChallengeForm = () => (
        <form onSubmit={handleChallengeSubmit} className="space-y-4">
             <div><label className="block text-sm font-medium text-slate-300">Venue Name</label><input type="text" name="venueName" value={formState.venueName || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" required /></div>
             <div><label className="block text-sm font-medium text-slate-300">Description</label><textarea name="description" value={formState.description || ''} onChange={handleInputChange} rows={3} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" required /></div>
             <div><label className="block text-sm font-medium text-slate-300">Address</label><input type="text" name="address" value={formState.address || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="e.g., 123 Music Row, Nashville, TN" /></div>
             <div><label className="block text-sm font-medium text-slate-300">Tour Cash Award</label><input type="number" name="points" value={formState.points || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" required /></div>
             <div><label className="block text-sm font-medium text-slate-300">Challenge Type</label><select name="type" value={formState.type || ChallengeType.GPS} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500">{Object.values(ChallengeType).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
             {formState.type === ChallengeType.Receipt && (
                <div><label className="block text-sm font-medium text-slate-300">Required Spend Amount ($)</label><input type="number" step="0.01" name="requiredAmount" value={formState.requiredAmount || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="e.g., 25.00" /></div>
             )}
             {formState.type === ChallengeType.Social && (
                <>
                    <div><label className="block text-sm font-medium text-slate-300">Validation Tag (e.g., @username)</label><input type="text" name="validationTag" value={formState.validationTag || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" /></div>
                    <div><label className="block text-sm font-medium text-slate-300">Social URL</label><input type="url" name="socialUrl" value={formState.socialUrl || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" /></div>
                </>
             )}
             {formState.type === ChallengeType.Booking && (
                <div><label className="block text-sm font-medium text-slate-300">Booking Email</label><input type="email" name="bookingEmail" value={formState.bookingEmail || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="booking@example.com" /></div>
             )}
             {formState.type === ChallengeType.QR_CODE && (
                <div><label className="block text-sm font-medium text-slate-300">QR Validation Data</label><input type="text" name="qrValidationData" value={formState.qrValidationData || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="SECRET_CODE_123" /></div>
             )}
             <div><label className="block text-sm font-medium text-slate-300">Icon</label><select name="iconName" value={formState.iconName || challengeIconOptions[0]} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500">{challengeIconOptions.map(name => <option key={name} value={name}>{name}</option>)}</select></div>
             <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-300">Latitude</label><input type="number" step="any" name="latitude" value={formState.latitude || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="e.g., 36.1627" /></div>
                <div><label className="block text-sm font-medium text-slate-300">Longitude</label><input type="number" step="any" name="longitude" value={formState.longitude || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="e.g., -86.7751" /></div>
             </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={closeForm} className="px-4 py-2 bg-slate-600 text-white font-bold rounded-md hover:bg-slate-500 transition-colors">Cancel</button>
                <button type="submit" style={{backgroundColor: themeSettings.primaryColor}} className="px-4 py-2 text-white font-bold rounded-md hover:opacity-90 transition-colors">Save Challenge</button>
            </div>
        </form>
    );

     const renderPerkForm = () => (
        <form onSubmit={handlePerkSubmit} className="space-y-4">
             <div><label className="block text-sm font-medium text-slate-300">Perk Name</label><input type="text" name="name" value={formState.name || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" required /></div>
             <div><label className="block text-sm font-medium text-slate-300">Description</label><textarea name="description" value={formState.description || ''} onChange={handleInputChange} rows={3} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" required /></div>
             <div><label className="block text-sm font-medium text-slate-300">Address</label><input type="text" name="address" value={formState.address || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="e.g., 123 Music Row, Nashville, TN" /></div>
             <div><label className="block text-sm font-medium text-slate-300">Required Tour Cash</label><input type="number" name="requiredPoints" value={formState.requiredPoints || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" required /></div>
             <div><label className="block text-sm font-medium text-slate-300">Icon</label><select name="iconName" value={formState.iconName || perkAndDealIconOptions[0]} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500">{perkAndDealIconOptions.map(name => <option key={name} value={name}>{name}</option>)}</select></div>
             <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-300">Latitude</label><input type="number" step="any" name="latitude" value={formState.latitude || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="e.g., 36.1627" /></div>
                <div><label className="block text-sm font-medium text-slate-300">Longitude</label><input type="number" step="any" name="longitude" value={formState.longitude || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="e.g., -86.7751" /></div>
             </div>
             <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={closeForm} className="px-4 py-2 bg-slate-600 text-white font-bold rounded-md hover:bg-slate-500 transition-colors">Cancel</button>
                <button type="submit" style={{backgroundColor: themeSettings.primaryColor}} className="px-4 py-2 text-white font-bold rounded-md hover:opacity-90 transition-colors">Save Perk</button>
            </div>
        </form>
    );

    const renderDealForm = () => (
        <form onSubmit={handleDealSubmit} className="space-y-4">
             <div><label className="block text-sm font-medium text-slate-300">Deal Name</label><input type="text" name="name" value={formState.name || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" required /></div>
             <div><label className="block text-sm font-medium text-slate-300">Description</label><textarea name="description" value={formState.description || ''} onChange={handleInputChange} rows={3} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" required /></div>
             <div><label className="block text-sm font-medium text-slate-300">QR Code Data</label><input type="text" name="qrCodeData" value={formState.qrCodeData || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="e.g., VENDOR_20_OFF" required /></div>
             <div><label className="block text-sm font-medium text-slate-300">Scan Count</label><input type="number" name="scanCount" value={formState.scanCount || '0'} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" /></div>
             <div><label className="block text-sm font-medium text-slate-300">Icon</label><select name="iconName" value={formState.iconName || perkAndDealIconOptions[0]} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500">{perkAndDealIconOptions.map(name => <option key={name} value={name}>{name}</option>)}</select></div>
             <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={closeForm} className="px-4 py-2 bg-slate-600 text-white font-bold rounded-md hover:bg-slate-500 transition-colors">Cancel</button>
                <button type="submit" style={{backgroundColor: themeSettings.primaryColor}} className="px-4 py-2 text-white font-bold rounded-md hover:opacity-90 transition-colors">Save Deal</button>
            </div>
        </form>
    );

     const renderUserForm = () => (
        <form onSubmit={handleUserSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-slate-300">Email</label><input type="email" name="email" value={formState.email || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" required /></div>
            <div><label className="block text-sm font-medium text-slate-300">Password</label><input type="password" name="password" value={formState.password || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder={'id' in editingItem ? 'Enter new password' : ''} required={'id' in editingItem ? false : true} /></div>
            <div><label className="block text-sm font-medium text-slate-300">Role</label><select name="role" value={formState.role || Role.Guest} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500">{Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}</select></div>
            {editingItem && 'id' in editingItem && (
                 <div className="pt-2">
                    <h4 className="font-semibold text-slate-300">Completed Challenges:</h4>
                    <ul className="list-disc list-inside text-slate-400 text-sm mt-1">
                        {Array.from((editingItem as User).completedChallengeIds).map(id => {
                            const challenge = challenges.find(c => c.id === id);
                            return <li key={id}>{challenge?.venueName || `Challenge ID: ${id}`}</li>;
                        })}
                        {(editingItem as User).completedChallengeIds.size === 0 && <li>None yet!</li>}
                    </ul>
                 </div>
            )}
             <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={closeForm} className="px-4 py-2 bg-slate-600 text-white font-bold rounded-md hover:bg-slate-500 transition-colors">Cancel</button>
                <button type="submit" style={{backgroundColor: themeSettings.primaryColor}} className="px-4 py-2 text-white font-bold rounded-md hover:opacity-90 transition-colors">Save User</button>
            </div>
        </form>
    );

    const renderVehicleForm = () => (
        <form onSubmit={handleVehicleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-slate-300">Vehicle Name</label><input type="text" name="name" value={formState.name || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" required /></div>
            <div><label className="block text-sm font-medium text-slate-300">Description</label><textarea name="description" value={formState.description || ''} onChange={handleInputChange} rows={3} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" required /></div>
            <div>
                <label className="block text-sm font-medium text-slate-300">Vehicle Image</label>
                <div className="mt-1 flex items-center space-x-4">
                    {formState.imageUrl && <img src={formState.imageUrl} alt="Vehicle preview" className="w-24 h-16 object-cover rounded-md bg-slate-700" />}
                    <input type="file" id="vehicle-image-upload" accept="image/*" onChange={handleVehicleImageUpload} className="hidden" />
                    <label htmlFor="vehicle-image-upload" className="cursor-pointer px-4 py-2 border border-slate-600 font-bold rounded-md hover:bg-slate-700 transition-colors">
                        Upload Image
                    </label>
                </div>
            </div>
            <div><label className="block text-sm font-medium text-slate-300">Capacity</label><input type="number" name="capacity" value={formState.capacity || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" required /></div>
            <div><label className="block text-sm font-medium text-slate-300">Vehicle Type</label><select name="type" value={formState.type || 'SUV'} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"><option>Sedan</option><option>SUV</option><option>Party Bus</option></select></div>
            <div><label className="block text-sm font-medium text-slate-300">iCal URL (for availability)</label><input type="url" name="iCalUrl" value={formState.iCalUrl || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" /></div>
            <div><label className="block text-sm font-medium text-slate-300">Stripe Payment Link</label><input type="url" name="stripePaymentLink" value={formState.stripePaymentLink || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="https://buy.stripe.com/..." required /></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-300">Quick Ride Fare ($)</label><input type="number" name="quickRideBaseFare" value={formState.quickRideBaseFare || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" required /></div>
                <div><label className="block text-sm font-medium text-slate-300">Tour Rate ($/hr)</label><input type="number" name="tourHourlyRate" value={formState.tourHourlyRate || ''} onChange={handleInputChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" required /></div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={closeForm} className="px-4 py-2 bg-slate-600 text-white font-bold rounded-md hover:bg-slate-500 transition-colors">Cancel</button>
                <button type="submit" style={{backgroundColor: themeSettings.primaryColor}} className="px-4 py-2 text-white font-bold rounded-md hover:opacity-90 transition-colors">Save Vehicle</button>
            </div>
        </form>
    );

    const guestUsers = users.filter(u => u.role === Role.Guest).sort((a, b) => b.points - a.points);
    
    const renderAnalytics = () => {
        const dealScanData = deals.map(d => ({ name: d.name, Scans: d.scanCount || 0 }));

        const rockShopChallenge = challenges.find(c => c.venueName === 'Rock Shop');
        const rockShopCompletions = rockShopChallenge 
            ? users.filter(u => u.role === Role.Guest && u.completedChallengeIds.has(rockShopChallenge.id)).length 
            : 0;

        return (
            <div className="space-y-8">
                <section>
                    <h3 className="text-xl font-bold text-slate-200 mb-4">Deal Performance</h3>
                    <div className="bg-slate-700/50 p-4 rounded-lg h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dealScanData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        borderColor: '#334155',
                                        borderRadius: '0.5rem',
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '14px' }} />
                                <Bar dataKey="Scans" fill={themeSettings.primaryColor} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section>
                         <h3 className="text-xl font-bold text-slate-200 mb-4">Guest Leaderboard</h3>
                         <div className="space-y-2">
                             {guestUsers.slice(0, 5).map((u, index) => (
                                 <div key={u.id} className="bg-slate-700/50 p-3 rounded-lg flex items-center justify-between">
                                     <div className="flex items-center">
                                         <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-3 text-amber-400 font-bold text-lg">{index + 1}</div>
                                         <p className="font-semibold text-slate-100">{u.email}</p>
                                     </div>
                                     <p style={{color: themeSettings.secondaryColor}} className="font-bold">{u.points} TC</p>
                                 </div>
                             ))}
                         </div>
                    </section>
                    <section>
                         <h3 className="text-xl font-bold text-slate-200 mb-4">Key Metrics</h3>
                         <div className="bg-slate-700/50 p-4 rounded-lg">
                             <p className="text-slate-400">"Rock Shop" Challenge Completions</p>
                             <p style={{color: themeSettings.primaryColor}} className="text-4xl font-bold mt-2">{rockShopCompletions}</p>
                             <p className="text-xs text-slate-500 mt-1">Total revenue-generating challenges completed.</p>
                         </div>
                    </section>
                </div>
            </div>
        )
    }

    const renderThemeEditor = () => (
        <div className="space-y-6 bg-slate-700/50 p-6 rounded-lg">
            <div>
                <h3 className="text-lg font-bold text-slate-200 mb-2">Header Text</h3>
                <div className="space-y-3">
                     <div><label className="block text-sm font-medium text-slate-300">Main Header</label><input type="text" name="headerText" value={themeSettings.headerText} onChange={handleThemeChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" /></div>
                     <div><label className="block text-sm font-medium text-slate-300">Subheader</label><input type="text" name="subHeaderText" value={themeSettings.subHeaderText} onChange={handleThemeChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" /></div>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-200 mb-2">Colors & Font</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Primary Color</label>
                        <input type="color" name="primaryColor" value={themeSettings.primaryColor} onChange={handleThemeChange} className="w-full h-10 p-1 bg-slate-700 border border-slate-600 rounded-md cursor-pointer" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Secondary Color</label>
                        <input type="color" name="secondaryColor" value={themeSettings.secondaryColor} onChange={handleThemeChange} className="w-full h-10 p-1 bg-slate-700 border border-slate-600 rounded-md cursor-pointer" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Font Family</label>
                        <select name="fontFamily" value={themeSettings.fontFamily} onChange={handleThemeChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 h-10">
                            <option value="'Inter', sans-serif">Inter (Sans-serif)</option>
                            <option value="'Lora', serif">Lora (Serif)</option>
                            <option value="'Roboto Mono', monospace">Roboto Mono (Monospace)</option>
                        </select>
                    </div>
                </div>
            </div>
            <div>
                 <h3 className="text-lg font-bold text-slate-200 mb-2">Background Image</h3>
                 <div className="flex items-center space-x-4">
                    <input type="file" id="bg-upload" accept="image/*" onChange={handleBgImageChange} className="hidden" />
                    <label htmlFor="bg-upload" style={{borderColor: themeSettings.primaryColor, color: themeSettings.primaryColor}} className="cursor-pointer px-4 py-2 border font-bold rounded-md hover:opacity-80 transition-opacity">
                        Upload Image
                    </label>
                    {themeSettings.backgroundImage && (
                        <button onClick={removeBgImage} className="px-4 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-500 transition-colors">
                            Remove
                        </button>
                    )}
                 </div>
                 {themeSettings.backgroundImage && <img src={themeSettings.backgroundImage} alt="Background preview" className="mt-4 rounded-md max-h-40 w-auto" />}
            </div>
        </div>
    );

    return (
        <div className="w-full mx-auto bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <header className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
                <h1 className="text-3xl font-bold text-slate-100 flex items-center"><CogIcon className="w-8 h-8 mr-3" /> Admin Panel</h1>
                <div className="flex items-center space-x-4">
                    <button onClick={onLogout} className="text-slate-400 hover:text-white" title="Logout"><LogoutIcon className="w-7 h-7" /></button>
                    <button onClick={onExit} className="text-slate-400 hover:text-white" title="Exit Admin Panel"><CloseIcon className="w-8 h-8" /></button>
                </div>
            </header>

            <div className="flex space-x-1 rounded-lg bg-slate-700 p-1 mb-6 overflow-x-auto">
                <button onClick={() => setActiveTab('analytics')} className={`flex-shrink-0 w-full font-semibold py-2 px-3 rounded-md transition-colors ${activeTab === 'analytics' ? 'text-white' : 'text-slate-300 hover:bg-slate-600'}`} style={{backgroundColor: activeTab === 'analytics' ? themeSettings.primaryColor : undefined}}>Analytics</button>
                <button onClick={() => setActiveTab('theme')} className={`flex-shrink-0 w-full font-semibold py-2 px-3 rounded-md transition-colors ${activeTab === 'theme' ? 'text-white' : 'text-slate-300 hover:bg-slate-600'}`} style={{backgroundColor: activeTab === 'theme' ? themeSettings.primaryColor : undefined}}>Theme</button>
                <button onClick={() => setActiveTab('vehicles')} className={`flex-shrink-0 w-full font-semibold py-2 px-3 rounded-md transition-colors ${activeTab === 'vehicles' ? 'text-white' : 'text-slate-300 hover:bg-slate-600'}`} style={{backgroundColor: activeTab === 'vehicles' ? themeSettings.primaryColor : undefined}}>Vehicles</button>
                <button onClick={() => setActiveTab('users')} className={`flex-shrink-0 w-full font-semibold py-2 px-3 rounded-md transition-colors ${activeTab === 'users' ? 'text-white' : 'text-slate-300 hover:bg-slate-600'}`} style={{backgroundColor: activeTab === 'users' ? themeSettings.primaryColor : undefined}}>Users</button>
                <button onClick={() => setActiveTab('challenges')} className={`flex-shrink-0 w-full font-semibold py-2 px-3 rounded-md transition-colors ${activeTab === 'challenges' ? 'text-white' : 'text-slate-300 hover:bg-slate-600'}`} style={{backgroundColor: activeTab === 'challenges' ? themeSettings.primaryColor : undefined}}>Challenges</button>
                <button onClick={() => setActiveTab('perks')} className={`flex-shrink-0 w-full font-semibold py-2 px-3 rounded-md transition-colors ${activeTab === 'perks' ? 'text-white' : 'text-slate-300 hover:bg-slate-600'}`} style={{backgroundColor: activeTab === 'perks' ? themeSettings.primaryColor : undefined}}>Perks</button>
                <button onClick={() => setActiveTab('deals')} className={`flex-shrink-0 w-full font-semibold py-2 px-3 rounded-md transition-colors ${activeTab === 'deals' ? 'text-white' : 'text-slate-300 hover:bg-slate-600'}`} style={{backgroundColor: activeTab === 'deals' ? themeSettings.primaryColor : undefined}}>Deals</button>
            </div>
            
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'theme' && renderThemeEditor()}
            
            {activeTab === 'users' && (
                <div>
{/* Fix: Removed invalid ':hover' pseudo-selector from inline style. React's style prop does not support pseudo-selectors. */}
                     <button onClick={() => openForm()} className="flex items-center justify-center w-full px-4 py-3 mb-4 font-bold border-2 border-dashed border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors" style={{color: themeSettings.primaryColor, borderColor: '#475569'}}><PlusCircleIcon className="w-6 h-6 mr-2" /> Add New User</button>
                     <div className="space-y-3">
                         {guestUsers.map((u, index) => (
                             <div key={u.id} className="bg-slate-700/50 p-3 rounded-lg flex items-center justify-between">
                                 <div className="flex items-center">
                                     <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-3 text-amber-400 font-bold text-lg">{index + 1}</div>
                                     <div>
                                         <p className="font-semibold text-slate-100">{u.email}</p>
                                         <p className="text-xs text-slate-400">{u.points} TC</p>
                                     </div>
                                 </div>
                                 <div className="flex space-x-2">
                                     <button onClick={() => openForm(u)} className="p-2 text-slate-400 hover:text-cyan-400" title="Manage User"><UsersIcon className="w-5 h-5" /></button>
                                     <button onClick={() => setUsers(users.filter(i => i.id !== u.id))} className="p-2 text-slate-400 hover:text-red-500" title="Delete User"><TrashIcon className="w-5 h-5" /></button>
                                 </div>
                             </div>
                         ))}
                     </div>
                </div>
            )}

            {activeTab === 'challenges' && (
                <div>
{/* Fix: Removed invalid ':hover' pseudo-selector from inline style. React's style prop does not support pseudo-selectors. */}
                    <button onClick={() => openForm()} className="flex items-center justify-center w-full px-4 py-3 mb-4 font-bold border-2 border-dashed border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors" style={{color: themeSettings.primaryColor, borderColor: '#475569'}}><PlusCircleIcon className="w-6 h-6 mr-2" /> Add New Challenge</button>
                    <div className="space-y-3">
                        {challenges.map(c => (
                            <div key={c.id} className="bg-slate-700/50 p-3 rounded-lg flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-3" style={{color: themeSettings.primaryColor}}>{iconMap[c.iconName]}</div>
                                    <div>
                                        <p className="font-semibold text-slate-100">{c.venueName}</p>
                                        <p className="text-xs text-slate-400">{c.points} pts - {c.type}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => openForm(c)} className="p-2 text-slate-400 hover:text-cyan-400"><PencilIcon className="w-5 h-5" /></button>
                                    <button onClick={() => setChallenges(challenges.filter(i => i.id !== c.id))} className="p-2 text-slate-400 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'perks' && (
                 <div>
{/* Fix: Removed invalid ':hover' pseudo-selector from inline style. React's style prop does not support pseudo-selectors. */}
                    <button onClick={() => openForm()} className="flex items-center justify-center w-full px-4 py-3 mb-4 font-bold border-2 border-dashed border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors" style={{color: themeSettings.primaryColor, borderColor: '#475569'}}><PlusCircleIcon className="w-6 h-6 mr-2" /> Add New Perk</button>
                    <div className="space-y-3">
                        {perks.map(p => (
                            <div key={p.id} className="bg-slate-700/50 p-3 rounded-lg flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-3" style={{color: themeSettings.primaryColor}}>{iconMap[p.iconName]}</div>
                                    <div>
                                        <p className="font-semibold text-slate-100">{p.name}</p>
                                        <p className="text-xs text-slate-400">{p.requiredPoints} TC</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => openForm(p)} className="p-2 text-slate-400 hover:text-cyan-400"><PencilIcon className="w-5 h-5" /></button>
                                    <button onClick={() => setPerks(perks.filter(i => i.id !== p.id))} className="p-2 text-slate-400 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'deals' && (
                 <div>
{/* Fix: Removed invalid ':hover' pseudo-selector from inline style. React's style prop does not support pseudo-selectors. */}
                    <button onClick={() => openForm()} className="flex items-center justify-center w-full px-4 py-3 mb-4 font-bold border-2 border-dashed border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors" style={{color: themeSettings.primaryColor, borderColor: '#475569'}}><PlusCircleIcon className="w-6 h-6 mr-2" /> Add New Deal</button>
                    <div className="space-y-3">
                        {deals.map(d => (
                            <div key={d.id} className="bg-slate-700/50 p-3 rounded-lg flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-3" style={{color: themeSettings.primaryColor}}>{iconMap[d.iconName]}</div>
                                    <div>
                                        <p className="font-semibold text-slate-100">{d.name}</p>
                                        <p className="text-xs text-slate-400">{d.description}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => openForm(d)} className="p-2 text-slate-400 hover:text-cyan-400"><PencilIcon className="w-5 h-5" /></button>
                                    <button onClick={() => setDeals(deals.filter(i => i.id !== d.id))} className="p-2 text-slate-400 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'vehicles' && (
                <div>
{/* Fix: Removed invalid ':hover' pseudo-selector from inline style. React's style prop does not support pseudo-selectors. */}
                    <button onClick={() => openForm()} className="flex items-center justify-center w-full px-4 py-3 mb-4 font-bold border-2 border-dashed border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors" style={{color: themeSettings.primaryColor, borderColor: '#475569'}}><PlusCircleIcon className="w-6 h-6 mr-2" /> Add New Vehicle</button>
                    <div className="space-y-3">
                        {vehicles.map(v => (
                            <div key={v.id} className="bg-slate-700/50 p-3 rounded-lg flex items-center justify-between">
                                <div className="flex items-center">
                                    <img src={v.imageUrl} alt={v.name} className="w-16 h-10 object-cover rounded-md mr-4" />
                                    <div>
                                        <p className="font-semibold text-slate-100">{v.name}</p>
                                        <p className="text-xs text-slate-400">{v.type} - Seats {v.capacity}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => openForm(v)} className="p-2 text-slate-400 hover:text-cyan-400"><PencilIcon className="w-5 h-5" /></button>
                                    <button onClick={() => setVehicles(vehicles.filter(i => i.id !== v.id))} className="p-2 text-slate-400 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal Form */}
            {editingItem && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{'id' in editingItem ? 'Edit' : 'Add'} {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(1, -1)}</h2>
                        {activeTab === 'challenges' && renderChallengeForm()}
                        {activeTab === 'perks' && renderPerkForm()}
                        {activeTab === 'deals' && renderDealForm()}
                        {activeTab === 'users' && renderUserForm()}
                        {activeTab === 'vehicles' && renderVehicleForm()}
                    </div>
                </div>
            )}
        </div>
    );
};