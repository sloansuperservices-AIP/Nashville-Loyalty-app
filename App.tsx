import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Pass } from './components/Pass';
import { Perks } from './components/Perks';
import { Challenges } from './components/Challenges';
import { Challenge, ChallengeType, UserRank, Perk, User, Role, PartnerDeal, ThemeSettings, Vehicle, Booking, BookingType } from './types';
import { Chat } from './components/Chat';
import { AdminPanel } from './components/AdminPanel';
import { AtSymbolIcon, CameraIcon, MapPinIcon, ReceiptIcon, MusicNoteIcon, TicketIcon, GiftIcon, CrownIcon, CogIcon, CloseIcon, VideoCameraIcon, UsersIcon, LogoutIcon, QrCodeIcon, CalendarDaysIcon, ViewfinderCircleIcon, PaintBrushIcon, KeyIcon, CreditCardIcon, GoogleIcon, FacebookIcon, InstagramIcon, ChatBubbleIcon } from './components/Icons';
import { LoginScreen } from './components/LoginScreen';
import { PartnerDeals } from './components/Deals';
import { QrCodeModal } from './components/QrCodeModal';
import { QrScanner } from './components/QrScanner';
import { VehicleScheduling } from './components/VehicleScheduling';
import { BookingModal } from './components/BookingModal';
import { MyBookings } from './components/MyBookings';
import { PaymentModal } from './components/PaymentModal';
import { BottomNav } from './components/BottomNav';
import { MapView } from './components/MapView';
import { StatusBar } from './components/StatusBar';

// --- Icon Mapping for Serializable Data ---
const iconMap: { [key: string]: React.ReactNode } = {
    'MapPin': <MapPinIcon className="w-6 h-6" />,
    'Camera': <CameraIcon className="w-6 h-6" />,
    'VideoCamera': <VideoCameraIcon className="w-6 h-6" />,
    'Receipt': <ReceiptIcon className="w-6 h-6" />,
    'AtSymbol': <AtSymbolIcon className="w-6 h-6" />,
    'CalendarDays': <CalendarDaysIcon className="w-6 h-6" />,
    'ViewfinderCircle': <ViewfinderCircleIcon className="w-6 h-6" />,
    'MusicNote': <MusicNoteIcon className="w-6 h-6" />,
    'Ticket': <TicketIcon className="w-6 h-6" />,
    'Gift': <GiftIcon className="w-6 h-6" />,
    'Crown': <CrownIcon className="w-6 h-6" />,
    'Users': <UsersIcon className="w-6 h-6" />,
    'Logout': <LogoutIcon className="w-6 h-6" />,
    'QrCode': <QrCodeIcon className="w-6 h-6" />,
    'PaintBrush': <PaintBrushIcon className="w-6 h-6" />,
    'Key': <KeyIcon className="w-6 h-6" />,
    'CreditCard': <CreditCardIcon className="w-6 h-6" />,
    'Google': <GoogleIcon className="w-5 h-5" />,
    'Facebook': <FacebookIcon className="w-5 h-5" />,
    'Instagram': <InstagramIcon className="w-5 h-5" />,
};

// --- Initial Data Definitions ---
const INITIAL_CHALLENGES: Challenge[] = [
  { id: 1, venueName: "The Vinyl Tap", description: "Check-in at the bar.", points: 20, type: ChallengeType.GPS, iconName: 'MapPin', latitude: 36.1487, longitude: -86.7782, address: "2038 Greenwood Ave, Nashville, TN" },
  { id: 2, venueName: "Miss Kelly’s Karaoke", description: "Submit a video of you singing your heart out.", points: 35, type: ChallengeType.Video, iconName: 'VideoCamera', latitude: 36.1599, longitude: -86.7744, address: "207 Printer's Alley, Nashville, TN" },
  { id: 3, venueName: "Rock Shop", description: "Spend over $25 on some cool merch.", points: 50, type: ChallengeType.Receipt, iconName: 'Receipt', requiredAmount: 25, latitude: 36.1627, longitude: -86.7751, address: "123 Broadway, Nashville, TN" },
  { id: 7, venueName: "Secret Speakeasy", description: "Find the hidden QR code inside the venue.", points: 75, type: ChallengeType.QR_CODE, iconName: 'ViewfinderCircle', qrValidationData: 'NASH_ROCK_SUITE_SECRET_CODE', latitude: 36.157, longitude: -86.7765, address: "Hidden Location, Downtown" },
  { id: 4, venueName: "The Echo Room", description: "Check-in to the legendary music hall.", points: 20, type: ChallengeType.GPS, iconName: 'MapPin', latitude: 36.151, longitude: -86.782, address: "123 Music Row, Nashville, TN" },
  { id: 5, venueName: "Skull’s Rainbow Room", description: "Post an Instagram pic with their famous neon sign. Tag @skullsrainbowroom.", points: 30, type: ChallengeType.Social, iconName: 'AtSymbol', validationTag: '@skullsrainbowroom', socialUrl: 'https://www.instagram.com/skullsrainbowroom/', latitude: 36.163, longitude: -86.776, address: "222 Printer's Alley, Nashville, TN" },
  { id: 6, venueName: "Rowdy Party Bus", description: "Request to book the party bus for your crew.", points: 100, type: ChallengeType.Booking, iconName: 'CalendarDays', bookingEmail: 'allinpropertiesnash@gmail.com', latitude: 36.160, longitude: -86.778, address: "City-wide, Nashville, TN" },
];

const INITIAL_PERKS: Perk[] = [
    { id: 1, name: 'Exclusive Playlist', description: 'Get access to a curated Rockstar playlist.', requiredPoints: 20, iconName: 'MusicNote' },
    { id: 2, name: 'Free Drink', description: 'Enjoy a complimentary drink at The Vinyl Tap.', requiredPoints: 50, iconName: 'Ticket', latitude: 36.1487, longitude: -86.7782, address: "2038 Greenwood Ave, Nashville, TN" },
    { id: 3, name: '10% Off Merch', description: 'Receive 10% off at the Rock Shop.', requiredPoints: 100, iconName: 'Gift', latitude: 36.1627, longitude: -86.7751, address: "123 Broadway, Nashville, TN" },
    { id: 4, name: 'VIP Lounge Access', description: 'One-time access to the VIP lounge at The Echo Room.', requiredPoints: 250, iconName: 'Crown', latitude: 36.151, longitude: -86.782, address: "123 Music Row, Nashville, TN" },
];

const INITIAL_DEALS: PartnerDeal[] = [
    { id: 1, name: 'MJ Coffee', description: '20% off your entire order.', qrCodeData: 'MJCOFFEE_20_OFF', iconName: 'Gift', scanCount: 0 },
    { id: 2, name: 'Coma Inducer', description: '20% off any purchase.', qrCodeData: 'COMA_INDUCER_20_OFF', iconName: 'Gift', scanCount: 0 },
    { id: 3, name: 'Music City WIne', description: '10% off all local wines.', qrCodeData: 'MCW_10_PERCENT', iconName: 'Ticket', scanCount: 0 },
    { id: 4, name: 'The Cellar', description: '2 for 1 drinks until 7pm.', qrCodeData: 'THE_CELLAR_BOGO_7PM', iconName: 'Ticket', scanCount: 0 },
    { id: 5, name: 'Wild Beaver', description: 'One free mechanical bull ride.', qrCodeData: 'WILD_BEAVER_FREE_RIDE', iconName: 'Ticket', scanCount: 0 },
];

const INITIAL_VEHICLES: Vehicle[] = [
    { id: 1, name: 'Cadillac Escalade', description: 'Luxury SUV for comfortable city travel.', imageUrl: 'https://img.sm360.ca/ir/w600/images/newcar/ca/2023/cadillac/escalade/sport-platinum/suv/exteriorColors/2023_cadillac_escalade_sport-platinum_032.png', capacity: 6, type: 'SUV', iCalUrl: 'https://calendar.google.com/calendar/ical/example%40gmail.com/public/basic.ics', quickRideBaseFare: 75, tourHourlyRate: 150, stripePaymentLink: 'https://buy.stripe.com/test_7sI6r1c3v5J0e4g000' },
    { id: 2, name: 'The Rockstar Limo', description: 'The ultimate party on wheels. Fully loaded.', imageUrl: 'https://www.crystalcoach.com/wp-content/uploads/2021/01/200-inch-white-cadillac-escalade-limo.png', capacity: 14, type: 'Party Bus', iCalUrl: 'https://calendar.google.com/calendar/ical/example2%40gmail.com/public/basic.ics', quickRideBaseFare: 200, tourHourlyRate: 300, stripePaymentLink: 'https://buy.stripe.com/test_7sI6r1c3v5J0e4g000' },
];

const DEFAULT_THEME_SETTINGS: ThemeSettings = {
    headerText: 'Rockstar Pass',
    subHeaderText: 'Your Backstage Pass to the City',
    primaryColor: '#a855f7',
    secondaryColor: '#22d3ee',
    fontFamily: "'Inter', sans-serif",
    backgroundImage: '',
};

const INITIAL_USERS: User[] = [
    { id: 1, email: 'admin@rockstar.app', password: 'admin', role: Role.Admin, points: 0, completedChallengeIds: new Set() },
    { id: 2, email: 'ariel@guest.app', role: Role.Guest, points: 70, completedChallengeIds: new Set([1, 2]) },
    { id: 3, email: 'devon@guest.app', role: Role.Guest, points: 100, completedChallengeIds: new Set([1, 3, 4]) },
    { id: 4, email: 'sabrina@guest.app', role: Role.Guest, points: 20, completedChallengeIds: new Set([1]) },
];

const ALL_RANKS: UserRank[] = [
    { name: 'Starving Artist', minPoints: 0, color: '#94a3b8' },
    { name: 'Opening Act', minPoints: 50, color: '#22d3ee' },
    { name: 'Headliner', minPoints: 150, color: '#a855f7' },
    { name: 'Living Legend', minPoints: 300, color: '#f59e0b' },
];

// --- Data Management ---
const userReviver = (key: any, value: any) => {
    if (key === 'completedChallengeIds') return new Set(value);
    return value;
}

const getInitialData = <T,>(key: string, fallback: T, reviver?: (key: any, value: any) => any): T => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item, reviver) : fallback;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return fallback;
    }
};

const INITIAL_APP_CONFIG = { challenges: INITIAL_CHALLENGES, perks: INITIAL_PERKS, deals: INITIAL_DEALS, vehicles: INITIAL_VEHICLES, theme: DEFAULT_THEME_SETTINGS };

const getInitialAppConfig = () => {
    try {
        const item = window.localStorage.getItem('rockstar_app_config_v2');
        if (item) {
            const savedConfig = JSON.parse(item);
            return { ...INITIAL_APP_CONFIG, ...savedConfig };
        }
        return INITIAL_APP_CONFIG;
    } catch (error) {
        console.error(`Error reading app config from localStorage:`, error);
        return INITIAL_APP_CONFIG;
    }
};

const App: React.FC = () => {
    const initialConfig = useMemo(() => getInitialAppConfig(), []);

    const [challenges, setChallenges] = useState<Challenge[]>(initialConfig.challenges);
    const [perks, setPerks] = useState<Perk[]>(initialConfig.perks);
    const [deals, setDeals] = useState<PartnerDeal[]>(initialConfig.deals);
    const [vehicles, setVehicles] = useState<Vehicle[]>(initialConfig.vehicles);
    const [themeSettings, setThemeSettings] = useState<ThemeSettings>(initialConfig.theme);
    
    const [users, setUsers] = useState<User[]>(() => getInitialData('rockstar_users_v2', INITIAL_USERS, userReviver));
    const [bookings, setBookings] = useState<Booking[]>(() => getInitialData('rockstar_bookings_v2', []));
    
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [validatingChallengeId, setValidatingChallengeId] = useState<number | null>(null);
    const [isAdminView, setIsAdminView] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<PartnerDeal | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scanningChallenge, setScanningChallenge] = useState<Challenge | null>(null);
    const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(null);
    const [bookingForPayment, setBookingForPayment] = useState<Booking | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('map');

    // --- Data Persistence ---
    useEffect(() => {
        // Migration/Cleanup: Clear old v1 keys to free up space
        try {
            if (localStorage.getItem('rockstar_app_config') || localStorage.getItem('rockstar_users')) {
                console.log('Cleaning up old storage keys to free space...');
                localStorage.removeItem('rockstar_app_config');
                localStorage.removeItem('rockstar_users');
                localStorage.removeItem('rockstar_bookings');
            }
        } catch (e) {
            console.error("Failed to clean up old keys:", e);
        }

        try {
            // Check usage approximation
            let totalSize = 0;
            for(let x in localStorage) {
                if(Object.prototype.hasOwnProperty.call(localStorage, x)) {
                    totalSize += ((localStorage[x].length + x.length) * 2);
                }
            }
            const totalSizeMB = totalSize / 1024 / 1024;
            if (totalSizeMB > 4.5) {
                console.warn(`Local storage is nearly full (${totalSizeMB.toFixed(2)}MB).`);
            }

            const userReplacer = (key: any, value: any) => {
                if(key === 'completedChallengeIds') return Array.from(value);
                return value;
            }
            localStorage.setItem('rockstar_users_v2', JSON.stringify(users, userReplacer));
            localStorage.setItem('rockstar_bookings_v2', JSON.stringify(bookings));

            const appConfig = { challenges, perks, deals, vehicles, theme: themeSettings };
            localStorage.setItem('rockstar_app_config_v2', JSON.stringify(appConfig));
        } catch (error) {
            console.error("Failed to save data to localStorage:", error);
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                alert("Storage quota exceeded! Your changes were NOT saved. Please use smaller images or clear browser data.");
            } else {
                 alert("Failed to save changes. Please check your browser settings.");
            }
        }
    }, [users, challenges, perks, deals, vehicles, bookings, themeSettings]);

    const handleSocialLogin = useCallback((email: string) => {
      let user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === Role.Guest);
      if (user) {
        setCurrentUser(user);
      } else {
        const newUser: User = {
          id: Date.now(),
          email: email.toLowerCase(),
          role: Role.Guest,
          points: 0,
          completedChallengeIds: new Set(),
        };
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
      }
    }, [users]);
    
    const handleAdminLogin = (email: string, password: string):boolean => {
        const user = users.find(u => u.email === email && u.password === password && u.role === Role.Admin);
        if (user) {
            setCurrentUser(user);
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setIsAdminView(false);
    };
    
    const handleCompleteChallenge = useCallback((challengeId: number, challengePoints: number) => {
        if (!currentUser || currentUser.completedChallengeIds.has(challengeId)) return;
        const updatedUser = {
            ...currentUser,
            points: currentUser.points + challengePoints,
            completedChallengeIds: new Set(currentUser.completedChallengeIds).add(challengeId),
        };
        setCurrentUser(updatedUser);
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    }, [currentUser]);

    const fileToBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
      });

    const handleImageValidation = useCallback(async (challenge: Challenge, imageFile: File) => {
      if (!imageFile || validatingChallengeId) return;
      setValidatingChallengeId(challenge.id);
      let promptText = '';
      
      if (challenge.type === ChallengeType.Receipt) {
        if (!challenge.requiredAmount) {
          console.error("Receipt challenge is missing 'requiredAmount'.");
          alert("Configuration error for this challenge. Please contact support.");
          setValidatingChallengeId(null);
          return;
        }
        promptText = `Analyze this receipt. Does it clearly mention the business "${challenge.venueName}"? Is the total amount greater than or equal to $${challenge.requiredAmount}? Respond with only 'YES' or 'NO'. Both conditions must be met.`;
      } else if (challenge.type === ChallengeType.Social) {
          promptText = `Analyze this screenshot. Does it contain the text '${challenge.validationTag}'? Respond with only 'YES' or 'NO'.`;
      } else if (challenge.type === ChallengeType.Photo) {
          promptText = `Is this a legitimate photo taken at a real-world location? Respond with only 'YES' or 'NO'.`;
      } else { 
          setValidatingChallengeId(null); 
          return; 
      }

      try {
        const base64Image = await fileToBase64(imageFile);
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [{ inlineData: { mimeType: imageFile.type, data: base64Image } }, { text: promptText }] }
        });
        if (response.text.trim().toUpperCase() === 'YES') {
          handleCompleteChallenge(challenge.id, challenge.points);
          alert('Validation successful! Points awarded.');
        } else {
          alert('Validation failed. Please try again.');
        }
      } catch (error) {
        console.error("Error validating image:", error);
        alert("An error occurred during validation.");
      } finally {
        setValidatingChallengeId(null);
      }
    }, [handleCompleteChallenge, validatingChallengeId]);

    const handleDealScan = (dealId: number) => setDeals(prev => prev.map(d => d.id === dealId ? { ...d, scanCount: (d.scanCount || 0) + 1 } : d));
    const handleQrScanStart = (challenge: Challenge) => { setScanningChallenge(challenge); setIsScannerOpen(true); };

    const handleScanSuccess = (decodedText: string) => {
        setIsScannerOpen(false);
        if (scanningChallenge && decodedText === scanningChallenge.qrValidationData) {
            handleCompleteChallenge(scanningChallenge.id, scanningChallenge.points);
            alert(`Success! You've completed the "${scanningChallenge.venueName}" challenge.`);
        } else {
            alert('Scan failed. Incorrect QR code.');
        }
        setScanningChallenge(null);
    };

    const handleInitiateBooking = (bookingDetails: Omit<Booking, 'id' | 'userId' | 'status'>) => {
        if (!currentUser) return;
        const newBooking: Booking = { ...bookingDetails, id: Date.now(), userId: currentUser.id, status: 'PENDING_PAYMENT' };
        setBookings(prev => [...prev, newBooking]);
        setBookingForPayment(newBooking);
        setBookingVehicle(null);
    };

    const handleConfirmPayment = (bookingId: number) => {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CONFIRMED' } : b));
        setBookingForPayment(null);
        const vehicle = vehicles.find(v => v.id === bookings.find(b => b.id === bookingId)?.vehicleId);
        alert(`Payment confirmed! Your booking for the ${vehicle?.name} is complete.`);
    };

    const userBookings = useMemo(() => currentUser ? bookings.filter(b => b.userId === currentUser.id && b.status === 'CONFIRMED') : [], [bookings, currentUser]);
    const userRank = useMemo(() => currentUser ? [...ALL_RANKS].reverse().find(rank => currentUser.points >= rank.minPoints) || ALL_RANKS[0] : ALL_RANKS[0], [currentUser]);
    const progress = useMemo(() => {
        if (!currentUser) return 0;
        const currentRankIndex = ALL_RANKS.findIndex(r => r.name === userRank.name);
        const nextRank = ALL_RANKS[currentRankIndex + 1];
        if (!nextRank) return 100;
        const pointsInTier = currentUser.points - userRank.minPoints;
        const pointsForNextTier = nextRank.minPoints - userRank.minPoints;
        return Math.min((pointsInTier / pointsForNextTier) * 100, 100);
    }, [currentUser, userRank]);

    const appStyle: React.CSSProperties = { fontFamily: themeSettings.fontFamily };
    if (themeSettings.backgroundImage) {
        appStyle.backgroundImage = `url(${themeSettings.backgroundImage})`;
        appStyle.backgroundSize = 'cover';
        appStyle.backgroundPosition = 'center';
        appStyle.backgroundAttachment = 'fixed';
    }

    if (!currentUser) return <LoginScreen onAdminLogin={handleAdminLogin} onSocialLogin={handleSocialLogin} users={users} themeSettings={themeSettings} iconMap={iconMap} />;
    
    const vehicleForPayment = bookingForPayment ? vehicles.find(v => v.id === bookingForPayment.vehicleId) : null;

    const renderContent = () => {
        switch(activeTab) {
            case 'map': return <MapView challenges={challenges} perks={perks} iconMap={iconMap} themeSettings={themeSettings} />;
            case 'challenges': return <Challenges user={currentUser} challenges={challenges} completedChallengeIds={currentUser.completedChallengeIds} onCompleteChallenge={handleCompleteChallenge} validatingChallengeId={validatingChallengeId} onImageSubmit={handleImageValidation} onQrScanStart={handleQrScanStart} iconMap={iconMap} themeSettings={themeSettings}/>;
            case 'pass': return <div className="space-y-8"><Pass user={currentUser} ranks={ALL_RANKS} rank={userRank} progress={progress} themeSettings={themeSettings}/><Perks currentPoints={currentUser.points} perks={perks} iconMap={iconMap} themeSettings={themeSettings} /></div>;
            case 'deals': return <PartnerDeals deals={deals} onDealClick={setSelectedDeal} iconMap={iconMap} themeSettings={themeSettings} />;
            case 'rides': return <div className="space-y-8"><VehicleScheduling vehicles={vehicles} onBook={setBookingVehicle} themeSettings={themeSettings} />{userBookings.length > 0 && <MyBookings bookings={userBookings} vehicles={vehicles} themeSettings={themeSettings} />}</div>;
            default: return null;
        }
    };

    return (
        <div style={appStyle} className={`min-h-screen ${!themeSettings.backgroundImage ? 'bg-slate-900' : ''} text-slate-100`}>
             <div className={`min-h-screen flex flex-col ${themeSettings.backgroundImage ? 'bg-slate-900/50 backdrop-blur-sm' : ''}`}>
                 {isAdminView ? (
                    <div className="p-4 md:p-8"><AdminPanel users={users} setUsers={setUsers} challenges={challenges} setChallenges={setChallenges} perks={perks} setPerks={setPerks} deals={deals} setDeals={setDeals} vehicles={vehicles} setVehicles={setVehicles} themeSettings={themeSettings} setThemeSettings={setThemeSettings} onExit={() => setIsAdminView(false)} onLogout={handleLogout} iconMap={iconMap}/></div>
                 ) : (
                    <>
                        <header className="flex-shrink-0 flex justify-between items-center p-4 sticky top-0 z-20 bg-slate-900/80 backdrop-blur-sm">
                             <div className="w-10">
                                {currentUser.role === Role.Admin && <button onClick={() => setIsAdminView(true)} className="text-slate-300 hover:text-white transition-colors p-2"><CogIcon className="w-6 h-6" /></button>}
                             </div>
                             <div className="text-center">
                                <h1 style={{ backgroundImage: `linear-gradient(to right, ${themeSettings.primaryColor}, ${themeSettings.secondaryColor})` }} className="text-2xl font-extrabold text-transparent bg-clip-text tracking-wide">{themeSettings.headerText}</h1>
                            </div>
                            <button onClick={() => setIsChatOpen(true)} className="text-slate-300 hover:text-white transition-colors p-2" aria-label="Open AI Concierge"><ChatBubbleIcon className="w-6 h-6"/></button>
                        </header>

                        <main className="flex-grow overflow-y-auto pb-24">
                            {activeTab !== 'map' ? (
                                <div className="p-4 space-y-4">
                                    <StatusBar user={currentUser} rank={userRank} themeSettings={themeSettings} />
                                    {renderContent()}
                                </div>
                            ) : (
                                renderContent() // Map view handles its own layout
                            )}
                        </main>
                        
                        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} themeSettings={themeSettings} />
                    </>
                 )}
            </div>
            
             <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} themeSettings={themeSettings} />
             {selectedDeal && <QrCodeModal deal={selectedDeal} onClose={() => setSelectedDeal(null)} onScan={() => handleDealScan(selectedDeal.id)} themeSettings={themeSettings} />}
             {isScannerOpen && <QrScanner onScanSuccess={handleScanSuccess} onClose={() => setIsScannerOpen(false)} />}
             {bookingVehicle && <BookingModal vehicle={bookingVehicle} onClose={() => setBookingVehicle(null)} onBook={handleInitiateBooking} themeSettings={themeSettings}/>}
             {bookingForPayment && vehicleForPayment && <PaymentModal booking={bookingForPayment} vehicle={vehicleForPayment} onClose={() => setBookingForPayment(null)} onConfirm={handleConfirmPayment} themeSettings={themeSettings} />}
        </div>
    );
};

export default App;