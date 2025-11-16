import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Pass } from './components/Pass';
import { Perks } from './components/Perks';
import { Challenges } from './components/Challenges';
import { Challenge, ChallengeType, UserRank, Perk, User, Role, PartnerDeal, ThemeSettings, Vehicle, Booking, BookingType } from './types';
import { Chat } from './components/Chat';
import { AdminPanel } from './components/AdminPanel';
import { AtSymbolIcon, CameraIcon, MapPinIcon, ReceiptIcon, MusicNoteIcon, TicketIcon, GiftIcon, CrownIcon, CogIcon, CloseIcon, VideoCameraIcon, UsersIcon, LogoutIcon, QrCodeIcon, CalendarDaysIcon, ViewfinderCircleIcon, PaintBrushIcon, KeyIcon, CreditCardIcon } from './components/Icons';
import { LoginScreen } from './components/LoginScreen';
import { PartnerDeals } from './components/Deals';
import { QrCodeModal } from './components/QrCodeModal';
import { QrScanner } from './components/QrScanner';
import { VehicleScheduling } from './components/VehicleScheduling';
import { BookingModal } from './components/BookingModal';
import { MyBookings } from './components/MyBookings';
import { PaymentModal } from './components/PaymentModal';


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
};

// --- Initial Data Definitions ---
const INITIAL_CHALLENGES: Challenge[] = [
  { id: 1, venueName: "The Vinyl Tap", description: "Check-in at the bar.", points: 20, type: ChallengeType.GPS, iconName: 'MapPin', position: [36.1613, -86.7785] },
  { id: 2, venueName: "Miss Kelly’s Karaoke", description: "Submit a video of you singing your heart out.", points: 35, type: ChallengeType.Video, iconName: 'VideoCamera', position: [36.1633, -86.7801] },
  { id: 3, venueName: "Rock Shop", description: "Spend over $25 on some cool merch.", points: 50, type: ChallengeType.Receipt, iconName: 'Receipt', requiredAmount: 25, position: [36.1623, -86.7779] },
  { id: 7, venueName: "Secret Speakeasy", description: "Find the hidden QR code inside the venue.", points: 75, type: ChallengeType.QR_CODE, iconName: 'ViewfinderCircle', qrValidationData: 'NASH_ROCK_SUITE_SECRET_CODE', position: [36.1600, -86.7745] },
  { id: 4, venueName: "The Echo Room", description: "Check-in to the legendary music hall.", points: 20, type: ChallengeType.GPS, iconName: 'MapPin', position: [36.1645, -86.7815] },
  { id: 5, venueName: "Skull’s Rainbow Room", description: "Post an Instagram pic with their famous neon sign. Tag @skullsrainbowroom.", points: 30, type: ChallengeType.Social, iconName: 'AtSymbol', validationTag: '@skullsrainbowroom', socialUrl: 'https://www.instagram.com/skullsrainbowroom/', position: [36.1628, -86.7767] },
  { id: 6, venueName: "Rowdy Party Bus", description: "Request to book the party bus for your crew.", points: 100, type: ChallengeType.Booking, iconName: 'CalendarDays', bookingEmail: 'allinpropertiesnash@gmail.com', position: [36.1658, -86.7844] },
  { id: 8, venueName: "Guitars of the Stars", description: "Take a photo of the iconic giant guitar outside the shop.", points: 40, type: ChallengeType.Photo, iconName: 'Camera', position: [36.1605, -86.7788], referenceImageUrl: 'https://i.imgur.com/gG8P3Xy.jpg' },
  { id: 9, venueName: "Skull’s Rainbow Room", description: "Spend over $100 for VIP status.", points: 100, type: ChallengeType.Receipt, iconName: 'Receipt', requiredAmount: 100, position: [36.1628, -86.7767] },
];

const INITIAL_PERKS: Perk[] = [
    { id: 1, name: 'Exclusive Playlist', description: 'Get access to a curated Rockstar playlist.', requiredPoints: 20, iconName: 'MusicNote', position: [36.1613, -86.7785] },
    { id: 2, name: 'Free Drink', description: 'Enjoy a complimentary drink at The Vinyl Tap.', requiredPoints: 50, iconName: 'Ticket', position: [36.1613, -86.7785] },
    { id: 3, name: '10% Off Merch', description: 'Receive 10% off at the Rock Shop.', requiredPoints: 100, iconName: 'Gift', position: [36.1623, -86.7779] },
    { id: 4, name: 'VIP Lounge Access', description: 'One-time access to the VIP lounge at The Echo Room.', requiredPoints: 250, iconName: 'Crown', position: [36.1645, -86.7815] },
];

const INITIAL_DEALS: PartnerDeal[] = [
    { id: 1, name: 'MJ Coffee', description: '20% off your entire order.', qrCodeData: 'MJCOFFEE_20_OFF', iconName: 'Gift', scanCount: 0, position: [36.1589, -86.7765] },
    { id: 2, name: 'Coma Inducer', description: '20% off any purchase.', qrCodeData: 'COMA_INDUCER_20_OFF', iconName: 'Gift', scanCount: 0, position: [36.1601, -86.7789] },
    { id: 3, name: 'Music City WIne', description: '10% off all local wines.', qrCodeData: 'MCW_10_PERCENT', iconName: 'Ticket', scanCount: 0, position: [36.1595, -86.7812] },
    { id: 4, name: 'The Cellar', description: '2 for 1 drinks until 7pm.', qrCodeData: 'THE_CELLAR_BOGO_7PM', iconName: 'Ticket', scanCount: 0, position: [36.1618, -86.7758] },
    { id: 5, name: 'Wild Beaver', description: 'One free mechanical bull ride.', qrCodeData: 'WILD_BEAVER_FREE_RIDE', iconName: 'Ticket', scanCount: 0, position: [36.1630, -86.7795] },
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
    { id: 1, username: 'admin', password: 'admin', role: Role.Admin, points: 0, completedChallengeIds: new Set() },
    { id: 2, username: 'Ariel', password: 'guest', role: Role.Guest, points: 70, completedChallengeIds: new Set([1, 2]) },
    { id: 3, username: 'Devon', password: 'guest', role: Role.Guest, points: 100, completedChallengeIds: new Set([1, 3, 4]) },
    { id: 4, username: 'Sabrina', password: 'guest', role: Role.Guest, points: 20, completedChallengeIds: new Set([1]) },
];

const ALL_RANKS: UserRank[] = [
    { name: 'Starving Artist', minPoints: 0, color: '#94a3b8' },
    { name: 'Opening Act', minPoints: 50, color: '#22d3ee' },
    { name: 'Headliner', minPoints: 150, color: '#a855f7' },
    { name: 'Living Legend', minPoints: 300, color: '#f59e0b' },
];

// --- Data Management ---
// Custom reviver to convert array back to Set for completedChallengeIds
const userReviver = (key: any, value: any) => {
    if (key === 'completedChallengeIds') {
        return new Set(value);
    }
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

const INITIAL_APP_CONFIG = {
    challenges: INITIAL_CHALLENGES,
    perks: INITIAL_PERKS,
    deals: INITIAL_DEALS,
    vehicles: INITIAL_VEHICLES,
    theme: DEFAULT_THEME_SETTINGS,
};

const getInitialAppConfig = () => {
    try {
        const item = window.localStorage.getItem('rockstar_app_config');
        if (item) {
            const savedConfig = JSON.parse(item);
            // Merge to ensure new properties from INITIAL_APP_CONFIG are added if they don't exist in saved data
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
    
    // User and booking data is kept separate as it's not part of the global admin config
    const [users, setUsers] = useState<User[]>(() => getInitialData('rockstar_users', INITIAL_USERS, userReviver));
    const [bookings, setBookings] = useState<Booking[]>(() => getInitialData('rockstar_bookings', []));
    
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [validatingChallengeId, setValidatingChallengeId] = useState<number | null>(null);
    const [isAdminView, setIsAdminView] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<PartnerDeal | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scanningChallenge, setScanningChallenge] = useState<Challenge | null>(null);
    const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(null);
    const [bookingForPayment, setBookingForPayment] = useState<Booking | null>(null);
    const [showMap, setShowMap] = useState(false);

    // --- Data Persistence ---
    useEffect(() => {
        try {
            // Custom replacer to convert Set to Array for JSON.stringify
            const userReplacer = (key: any, value: any) => {
                if(key === 'completedChallengeIds') {
                    return Array.from(value);
                }
                return value;
            }
            localStorage.setItem('rockstar_users', JSON.stringify(users, userReplacer));
            localStorage.setItem('rockstar_bookings', JSON.stringify(bookings));

            const appConfig = {
                challenges,
                perks,
                deals,
                vehicles,
                theme: themeSettings,
            };
            localStorage.setItem('rockstar_app_config', JSON.stringify(appConfig));

        } catch (error) {
            console.error("Failed to save data to localStorage:", error);
            alert("Could not save changes. Your browser's storage might be full or disabled.");
        }
    }, [users, challenges, perks, deals, vehicles, bookings, themeSettings]);

    // --- Auth Handlers ---
    const handleLogin = (username: string, password: string):boolean => {
        const user = users.find(u => u.username === username && u.password === password);
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
    
    // --- Challenge Handlers ---
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
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
      });

    // Helper function to convert a URL to a Gemini Part
    async function urlToGenerativePart(url: string, mimeType: string) {
        const response = await fetch(url);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        return {
            inlineData: {
                data: base64,
                mimeType,
            },
        };
    }

    const handleImageValidation = useCallback(async (challenge: Challenge, imageFile: File) => {
      if (!imageFile || validatingChallengeId) return;

      setValidatingChallengeId(challenge.id);

      let promptText = '';
      let successMessage = '';
      let failureMessage = '';
      const imageParts: any[] = [];

      try {
        const base64Image = await fileToBase64(imageFile);
        imageParts.push({ inlineData: { mimeType: imageFile.type, data: base64Image } });

        if (challenge.type === ChallengeType.Receipt && challenge.requiredAmount) {
            promptText = `Analyze this receipt. Does it clearly show the name "${challenge.venueName}" and a total amount greater than or equal to $${challenge.requiredAmount}? Respond with only 'YES' or 'NO'.`;
            successMessage = 'Receipt approved! Points awarded.';
            failureMessage = `Validation Failed: The AI determined the receipt does not meet the requirements for ${challenge.venueName}. Please try again.`;
        } else if (challenge.type === ChallengeType.Social && challenge.validationTag) {
            promptText = `Analyze this screenshot of a social media post. Does it contain the text '${challenge.validationTag}'? Respond with only 'YES' or 'NO'.`;
            successMessage = 'Social post verified! Points awarded.';
            failureMessage = `Validation Failed: The AI could not find the tag '${challenge.validationTag}' in the screenshot. Please try again.`;
        } else if (challenge.type === ChallengeType.Photo && challenge.referenceImageUrl) {
            promptText = `Compare these two images. Does the first image (the user's submission) depict the same primary subject or landmark as the second image (the reference)? The angle, lighting, and other people in the photo do not need to match perfectly, but the core subject must be the same. Respond with only 'YES' or 'NO'.`;
            successMessage = 'Photo submission accepted! Points awarded.';
            failureMessage = 'Validation Failed: The AI determined this photo does not match the reference image. Please try again.';
            // Assuming the reference image is a JPEG. Adjust if necessary.
            const referenceImagePart = await urlToGenerativePart(challenge.referenceImageUrl, 'image/jpeg');
            imageParts.push(referenceImagePart);
        } else {
            // Fallback for simple photo challenges without a reference
            promptText = `Analyze this photo for a scavenger hunt. Does it appear to be a legitimate photo taken by a person at a real-world location (like a bar, venue, or landmark)? Respond with only 'YES' or 'NO'.`;
            successMessage = 'Photo submission accepted! Points awarded.';
            failureMessage = 'Validation Failed: The AI determined this photo might not be suitable for the challenge. Please try again with a different picture.';
        }

        if (!promptText) {
            setValidatingChallengeId(null);
            return;
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [...imageParts, { text: promptText }] }
        });

        const resultText = response.text.trim().toUpperCase();

        if (resultText === 'YES') {
          handleCompleteChallenge(challenge.id, challenge.points);
          alert(successMessage);
        } else {
          alert(failureMessage);
        }
      } catch (error) {
        console.error("Error validating image:", error);
        alert("An error occurred during validation. Please check the console and try again.");
      } finally {
        setValidatingChallengeId(null);
      }
    }, [handleCompleteChallenge, validatingChallengeId]);

    const handleDealScan = (dealId: number) => {
        setDeals(prevDeals =>
            prevDeals.map(deal =>
                deal.id === dealId ? { ...deal, scanCount: (deal.scanCount || 0) + 1 } : deal
            )
        );
    };

    const handleQrScanStart = (challenge: Challenge) => {
        setScanningChallenge(challenge);
        setIsScannerOpen(true);
    };

    const handleScanSuccess = (decodedText: string) => {
        setIsScannerOpen(false);
        if (scanningChallenge && decodedText === scanningChallenge.qrValidationData) {
            handleCompleteChallenge(scanningChallenge.id, scanningChallenge.points);
            alert(`Success! You've completed the "${scanningChallenge.venueName}" challenge.`);
        } else {
            alert('Scan failed. This is not the correct QR code for this challenge.');
        }
        setScanningChallenge(null);
    };

    // --- Booking Handlers ---
    const handleInitiateBooking = (bookingDetails: Omit<Booking, 'id' | 'userId' | 'status'>) => {
        if (!currentUser) return;
        const newBooking: Booking = {
            ...bookingDetails,
            id: Date.now(),
            userId: currentUser.id,
            status: 'PENDING_PAYMENT'
        };
        setBookings(prev => [...prev, newBooking]);
        setBookingForPayment(newBooking);
        setBookingVehicle(null);
    };

    const handleConfirmPayment = (bookingId: number) => {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CONFIRMED' } : b));
        setBookingForPayment(null);
        const confirmedBooking = bookings.find(b => b.id === bookingId);
        const vehicle = vehicles.find(v => v.id === confirmedBooking?.vehicleId);
        alert(`Payment confirmed! Your booking for the ${vehicle?.name} is complete.`);
    };

    const userBookings = useMemo(() => {
        if (!currentUser) return [];
        return bookings.filter(b => b.userId === currentUser.id && b.status === 'CONFIRMED');
    }, [bookings, currentUser]);


    const userRank = useMemo(() => {
        if (!currentUser) return ALL_RANKS[0];
        return [...ALL_RANKS].reverse().find(rank => currentUser.points >= rank.minPoints) || ALL_RANKS[0];
    }, [currentUser]);
    
    const progress = useMemo(() => {
        if (!currentUser) return 0;
        const currentRankIndex = ALL_RANKS.findIndex(r => r.name === userRank.name);
        const nextRank = ALL_RANKS[currentRankIndex + 1];
        if (!nextRank) {
            return 100;
        }
        const pointsInTier = currentUser.points - userRank.minPoints;
        const pointsForNextTier = nextRank.minPoints - userRank.minPoints;
        return Math.min((pointsInTier / pointsForNextTier) * 100, 100);
    }, [currentUser, userRank]);

    const appStyle: React.CSSProperties = {
        fontFamily: themeSettings.fontFamily,
    };

    if (themeSettings.backgroundImage) {
        appStyle.backgroundImage = `url(${themeSettings.backgroundImage})`;
        appStyle.backgroundSize = 'cover';
        appStyle.backgroundPosition = 'center';
        appStyle.backgroundAttachment = 'fixed';
    }

    if (!currentUser) {
        return <LoginScreen onLogin={handleLogin} users={users} themeSettings={themeSettings} />;
    }
    
    const vehicleForPayment = bookingForPayment ? vehicles.find(v => v.id === bookingForPayment.vehicleId) : null;

    return (
        <div style={appStyle} className={`min-h-screen ${!themeSettings.backgroundImage ? 'bg-slate-900' : ''} text-slate-100 p-4 md:p-8`}>
             <div className={`container mx-auto max-w-4xl ${themeSettings.backgroundImage ? 'bg-slate-900/50 backdrop-blur-sm rounded-2xl p-4 md:p-8' : ''}`}>
                 {isAdminView ? (
                    <AdminPanel 
                        users={users}
                        setUsers={setUsers}
                        challenges={challenges}
                        setChallenges={setChallenges}
                        perks={perks}
                        setPerks={setPerks}
                        deals={deals}
                        setDeals={setDeals}
                        vehicles={vehicles}
                        setVehicles={setVehicles}
                        themeSettings={themeSettings}
                        setThemeSettings={setThemeSettings}
                        onExit={() => setIsAdminView(false)}
                        onLogout={handleLogout}
                        iconMap={iconMap}
                    />
                 ) : (
                    <>
                        <header className="text-center mb-8">
                            <h1 style={{ backgroundImage: `linear-gradient(to right, ${themeSettings.primaryColor}, ${themeSettings.secondaryColor})` }} className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text tracking-wide">
                                {themeSettings.headerText}
                            </h1>
                            <p className="text-slate-400">{themeSettings.subHeaderText}</p>
                        </header>

                        <main className="space-y-8 md:space-y-12">
                            <section>
                                <Pass 
                                    user={currentUser}
                                    ranks={ALL_RANKS}
                                    rank={userRank} 
                                    progress={progress}
                                    themeSettings={themeSettings}
                                />
                                <button onClick={() => setShowMap(!showMap)} className="w-full mt-4 py-2 px-4 bg-slate-700 text-white font-bold rounded-md hover:bg-slate-600 transition-colors">
                                    {showMap ? 'Hide Map' : 'Show Map'}
                                </button>
                            </section>

                            {showMap && (
                                <section>
                                    <Locations challenges={challenges} perks={perks} deals={deals} />
                                </section>
                            )}

                            <section>
                                <VehicleScheduling vehicles={vehicles} onBook={setBookingVehicle} themeSettings={themeSettings} />
                            </section>
                            
                            {userBookings.length > 0 &&
                                <section>
                                    <MyBookings bookings={userBookings} vehicles={vehicles} themeSettings={themeSettings} />
                                </section>
                            }

                            <section>
                                <Challenges 
                                    username={currentUser.username}
                                    challenges={challenges}
                                    completedChallengeIds={currentUser.completedChallengeIds}
                                    onCompleteChallenge={handleCompleteChallenge}
                                    validatingChallengeId={validatingChallengeId}
                                    onImageSubmit={handleImageValidation}
                                    onQrScanStart={handleQrScanStart}
                                    iconMap={iconMap}
                                    themeSettings={themeSettings}
                                />
                            </section>

                            <section>
                                <Perks currentPoints={currentUser.points} perks={perks} iconMap={iconMap} themeSettings={themeSettings} />
                            </section>

                            <section>
                                <PartnerDeals deals={deals} onDealClick={setSelectedDeal} iconMap={iconMap} themeSettings={themeSettings} />
                            </section>

                        </main>
                        
                        <footer className="text-center mt-12 text-slate-500 text-sm">
                            <p>&copy; {new Date().getFullYear()} Rockstar Hospitality Pass. All rights reserved.</p>
                        </footer>
                        <Chat themeSettings={themeSettings} />
                    </>
                 )}
            </div>
             {currentUser.role === Role.Admin && (
                <div className="fixed bottom-24 right-6 z-50">
                    <button 
                        onClick={() => setIsAdminView(!isAdminView)} 
                        className="w-16 h-16 bg-slate-600 rounded-full text-white flex items-center justify-center shadow-lg hover:bg-slate-500 transition-all duration-300 transform hover:scale-110"
                        aria-label={isAdminView ? "Exit Admin Panel" : "Open Admin Panel"}
                    >
                        {isAdminView ? <CloseIcon className="w-8 h-8" /> : <CogIcon className="w-8 h-8" />}
                    </button>
                </div>
             )}
             {selectedDeal && (
                <QrCodeModal deal={selectedDeal} onClose={() => setSelectedDeal(null)} onScan={() => handleDealScan(selectedDeal.id)} themeSettings={themeSettings} />
             )}
             {isScannerOpen && (
                <QrScanner 
                    onScanSuccess={handleScanSuccess} 
                    onClose={() => setIsScannerOpen(false)} 
                />
             )}
             {bookingVehicle && (
                <BookingModal
                    vehicle={bookingVehicle}
                    onClose={() => setBookingVehicle(null)}
                    onBook={handleInitiateBooking}
                    themeSettings={themeSettings}
                />
             )}
             {bookingForPayment && vehicleForPayment && (
                <PaymentModal
                    booking={bookingForPayment}
                    vehicle={vehicleForPayment}
                    onClose={() => setBookingForPayment(null)}
                    onConfirm={handleConfirmPayment}
                    themeSettings={themeSettings}
                />
             )}
        </div>
    );
};

export default App;