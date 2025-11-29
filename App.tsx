import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Pass } from './components/Pass';
import { Perks } from './components/Perks';
import { Challenges } from './components/Challenges';
import { Challenge, ChallengeType, UserRank, Perk, User, Role, PartnerDeal, ThemeSettings, Vehicle, Booking, BookingType } from './types';
import { Chat } from './components/Chat';
import { AdminPanel } from './components/AdminPanel';
import { AtSymbolIcon, CameraIcon, MapPinIcon, ReceiptIcon, MusicNoteIcon, TicketIcon, GiftIcon, CrownIcon, CogIcon, CloseIcon, VideoCameraIcon, UsersIcon, LogoutIcon, QrCodeIcon, CalendarDaysIcon, ViewfinderCircleIcon, PaintBrushIcon, KeyIcon, CreditCardIcon, GoogleIcon, FacebookIcon, InstagramIcon, ChatBubbleIcon, ListBulletIcon, PlayCircleIcon } from './components/Icons';
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
    'ListBullet': <ListBulletIcon className="w-6 h-6" />,
    'PlayCircle': <PlayCircleIcon className="w-6 h-6" />,
};

// --- Initial Data Definitions ---
const INITIAL_CHALLENGES: Challenge[] = [
  { 
      id: 1, 
      venueName: "SCHOOL OF ROCK", 
      description: "Complete the ultimate Nashville music pilgrimage by visiting the three locations that shaped American music.", 
      points: 100, 
      type: ChallengeType.SCAVENGER_HUNT, 
      iconName: 'MusicNote', 
      scavengerHuntItems: ["Ryman Auditorium - birthplace of bluegrass", "Grand Ole Opry - the stage that made country music famous", "Country Music Hall of Fame - the archive of legends"],
      latitude: 36.1613,
      longitude: -86.7777,
      address: "Downtown Nashville"
  },
  { 
      id: 2, 
      venueName: "GIBSON GUITAR FLIGHT HERO", 
      description: "Buy the Gibson x Short Mountain Tennessee Whiskey Flight served on a limited-edition Gibson-wood Tennessee paddle (souvenir).", 
      points: 150, 
      type: ChallengeType.Receipt, 
      iconName: 'Receipt', 
      requiredAmount: 15, // Approx cost of flight
      latitude: 36.1627, 
      longitude: -86.7751, 
      address: "Gibson Garage" 
  },
  { 
      id: 3, 
      venueName: "KARAOKE KING / QUEEN", 
      description: "Perform a song, record a 5-second clip, and tag #KaraokeKingNashville. Your group votes for the winner.", 
      points: 50, 
      type: ChallengeType.Social, 
      iconName: 'VideoCamera', 
      validationTag: '#KaraokeKingNashville',
      socialUrl: 'https://instagram.com',
      latitude: 36.1599, 
      longitude: -86.7744, 
      address: "Miss Kelly's" 
  },
  { 
      id: 4, 
      venueName: "EYE OF THE TIGER", 
      description: "Highest score in your group wins the Champion Payday. Visit three competition spots.", 
      points: 75, 
      type: ChallengeType.SCAVENGER_HUNT, 
      iconName: 'ListBullet', 
      scavengerHuntItems: ["Darts at The Cellar", "Indoor Kart Time Trial", "Billiards at Bearded Iris Brewery"],
      latitude: 36.162, 
      longitude: -86.778, 
      address: "Various Locations" 
  },
  { 
      id: 5, 
      venueName: "TOPGOLF TITAN TRIAL", 
      description: "Hit 30 balls, screenshot your final score, and upload it. Break 150 points -> receive DOUBLE POINTS.", 
      points: 200, 
      type: ChallengeType.Photo, 
      iconName: 'Camera', 
      latitude: 36.18, 
      longitude: -86.78, 
      address: "Topgolf Nashville" 
  },
  { 
      id: 6, 
      venueName: "HALL OF FAMER", 
      description: "Highest score in your group wins the Champion Payday. Visit three competition spots.", 
      points: 100, 
      type: ChallengeType.SCAVENGER_HUNT, 
      iconName: 'Crown', 
      scavengerHuntItems: ["Darts at The Cellar", "Indoor Kart Time Trial", "Topgolf Scoreboard Challenge"],
      latitude: 36.16, 
      longitude: -86.77, 
      address: "Downtown Nashville" 
  },
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
    { 
        id: 1, 
        name: 'The Pink Vintage', 
        description: 'Broadway Drop Off & Pick Up. A classic pink roadster perfect for making an entrance.', 
        imageUrl: 'https://images.unsplash.com/photo-1552519507-da8b1227facf?q=80&w=800&auto=format&fit=crop', 
        capacity: 7, 
        type: 'Sedan', 
        iCalUrl: 'https://calendar.google.com/calendar/ical/example%40gmail.com/public/basic.ics', 
        quickRideBaseFare: 30, 
        tourHourlyRate: 120, 
        stripePaymentLink: 'https://buy.stripe.com/test_7sI6r1c3v5J0e4g000' 
    },
    { 
        id: 2, 
        name: 'Teal Touring Car', 
        description: 'Self-guided tour around Nashville. Go at your own pace with your crew.', 
        imageUrl: 'https://images.unsplash.com/photo-1532974297617-c0f05fe48bff?q=80&w=800&auto=format&fit=crop', 
        capacity: 7, 
        type: 'SUV', 
        iCalUrl: 'https://calendar.google.com/calendar/ical/example2%40gmail.com/public/basic.ics', 
        quickRideBaseFare: 30, 
        tourHourlyRate: 120, 
        stripePaymentLink: 'https://buy.stripe.com/test_7sI6r1c3v5J0e4g000' 
    },
    { 
        id: 3, 
        name: 'Midnight Classic Coach', 
        description: 'Perfect for larger groups (8-12). Choose any 1.5 hour guided tour.', 
        imageUrl: 'https://images.unsplash.com/photo-1495360019602-e001921678fe?q=80&w=800&auto=format&fit=crop', 
        capacity: 12, 
        type: 'Party Bus', 
        iCalUrl: 'https://calendar.google.com/calendar/ical/example3%40gmail.com/public/basic.ics', 
        quickRideBaseFare: 50, 
        tourHourlyRate: 160, 
        stripePaymentLink: 'https://buy.stripe.com/test_7sI6r1c3v5J0e4g000' 
    }
];

const DEFAULT_THEME_SETTINGS: ThemeSettings = {
    headerText: 'Rockstar Hospitality Pass',
    subHeaderText: 'Your All-Access Backstage Pass to Nashville',
    primaryColor: '#a855f7', // Purple - Rockstar Default
    secondaryColor: '#ec4899', // Pink - Rockstar Default
    fontFamily: "'Inter', sans-serif", // Standard App Font
    backgroundImage: '',
};

const INITIAL_USERS: User[] = [
    { id: 1, email: 'admin@rockstar.app', password: 'admin', role: Role.Admin, points: 0, completedChallengeIds: new Set(), scavengerHuntProgress: {} },
    { id: 2, email: 'ariel@guest.app', role: Role.Guest, points: 70, completedChallengeIds: new Set([1, 2]), scavengerHuntProgress: {} },
    { id: 3, email: 'devon@guest.app', role: Role.Guest, points: 100, completedChallengeIds: new Set([1, 3, 4]), scavengerHuntProgress: {} },
    { id: 4, email: 'sabrina@guest.app', role: Role.Guest, points: 20, completedChallengeIds: new Set([1]), scavengerHuntProgress: {} },
];

const ALL_RANKS: UserRank[] = [
    { name: 'Starving Artist', minPoints: 0, color: '#94a3b8' },
    { name: 'Opening Act', minPoints: 50, color: '#22d3ee' },
    { name: 'Headliner', minPoints: 150, color: '#d4af37' },
    { name: 'Living Legend', minPoints: 300, color: '#f59e0b' },
];

// --- Data Management ---
const STORAGE_KEY_CONFIG = 'rockstar_app_config_v5'; // Incremented to v5 to apply branding revert
const LEGACY_STORAGE_KEYS = ['rockstar_app_config_v4', 'rockstar_app_config_v3', 'rockstar_app_config_v2', 'rockstar_app_config', 'app_config']; 
const STORAGE_KEY_USERS = 'rockstar_users';
const STORAGE_KEY_BOOKINGS = 'rockstar_bookings';

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
        // 1. Try V5 (Current)
        const item = window.localStorage.getItem(STORAGE_KEY_CONFIG);
        if (item) {
            const savedConfig = JSON.parse(item);
            return { ...INITIAL_APP_CONFIG, ...savedConfig };
        }

        // 2. Try Migration from Legacy Keys
        for (const key of LEGACY_STORAGE_KEYS) {
             const legacyItem = window.localStorage.getItem(key);
             if (legacyItem) {
                 console.log(`Migrating configuration from legacy key: ${key}`);
                 const legacyConfig = JSON.parse(legacyItem);
                 // Migrate data but enforce the Reverted Theme and New Vehicles
                 return { 
                     ...INITIAL_APP_CONFIG, 
                     ...legacyConfig, 
                     vehicles: INITIAL_VEHICLES, 
                     theme: DEFAULT_THEME_SETTINGS 
                 };
             }
        }

        // 3. Fallback to code defaults
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
    
    const [users, setUsers] = useState<User[]>(() => getInitialData(STORAGE_KEY_USERS, INITIAL_USERS, userReviver));
    const [bookings, setBookings] = useState<Booking[]>(() => getInitialData(STORAGE_KEY_BOOKINGS, []));
    
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
    // Save Users and Bookings automatically (Low size data)
    useEffect(() => {
        try {
            const userReplacer = (key: any, value: any) => {
                if(key === 'completedChallengeIds') return Array.from(value);
                return value;
            }
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users, userReplacer));
            localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
        } catch (error) {
             console.error("Failed to auto-save users/bookings:", error);
        }
    }, [users, bookings]);

    // Robust Config Save Logic
    const saveConfigToStorage = useCallback((config: typeof INITIAL_APP_CONFIG, isManual: boolean = false) => {
        try {
            localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
            if (isManual) alert("Configuration saved successfully!");
        } catch (error) {
            console.warn("Storage full. Attempting to save without heavy images...");
            
            // Fail-safe: Strip images and try saving text-only data
            const leanConfig = {
                ...config,
                theme: { ...config.theme, backgroundImage: '' },
                vehicles: config.vehicles.map(v => ({ ...v, imageUrl: '' }))
            };

            try {
                localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(leanConfig));
                const msg = "Storage quota exceeded! Saved TEXT changes only. Images were removed to preserve your data.";
                console.warn(msg);
                if (isManual) alert(msg);
            } catch (retryError) {
                const msg = "Critical Error: Storage completely full. Cannot save any changes. Please clear browser data.";
                console.error(msg, retryError);
                if (isManual) alert(msg);
            }
        }
    }, []);

    // Auto-save Config (Debounced or direct)
    // We run this to ensure small tweaks (like changing a title) are saved even if user forgets to click "Save"
    useEffect(() => {
        const config = { challenges, perks, deals, vehicles, theme: themeSettings };
        // We use a timeout to avoid spamming localStorage on every keystroke
        const timer = setTimeout(() => {
             saveConfigToStorage(config, false);
        }, 1000);
        return () => clearTimeout(timer);
    }, [challenges, perks, deals, vehicles, themeSettings, saveConfigToStorage]);


    const handleManualSaveConfig = useCallback(() => {
        const appConfig = { challenges, perks, deals, vehicles, theme: themeSettings };
        saveConfigToStorage(appConfig, true);
    }, [challenges, perks, deals, vehicles, themeSettings, saveConfigToStorage]);

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
          scavengerHuntProgress: {},
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

    const handleScavengerItemComplete = useCallback((challengeId: number, itemIndex: number, challenge: Challenge) => {
        if (!currentUser) return;
        
        const currentProgress = currentUser.scavengerHuntProgress || {};
        const challengeProgress = currentProgress[challengeId] || [];
        
        // If already completed this item, ignore
        if (challengeProgress.includes(itemIndex)) return;

        const newChallengeProgress = [...challengeProgress, itemIndex];
        const newProgress = {
            ...currentProgress,
            [challengeId]: newChallengeProgress
        };
        
        let updatedUser = {
            ...currentUser,
            scavengerHuntProgress: newProgress
        };

        // Check if all items are found
        const totalItems = challenge.scavengerHuntItems?.length || 0;
        if (newChallengeProgress.length >= totalItems) {
            // Mark entire challenge as complete and award points
             updatedUser = {
                ...updatedUser,
                points: updatedUser.points + challenge.points,
                completedChallengeIds: new Set(updatedUser.completedChallengeIds).add(challengeId),
            };
            alert(`Awesome! You've found everything in the "${challenge.venueName}" hunt!`);
        } else {
             alert(`Great find! You have ${totalItems - newChallengeProgress.length} items left to find.`);
        }

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

    const handleImageValidation = useCallback(async (challenge: Challenge, imageFile: File, scavengerItemIndex?: number, scavengerItemDescription?: string) => {
      if (!imageFile || validatingChallengeId) return;
      setValidatingChallengeId(challenge.id);
      let promptText = '';
      
      if (scavengerItemDescription) {
          promptText = `Look at this photo. Does it contain "${scavengerItemDescription}"? Respond with only 'YES' or 'NO'.`;
      } else if (challenge.type === ChallengeType.Receipt) {
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
          if (scavengerItemIndex !== undefined) {
             handleScavengerItemComplete(challenge.id, scavengerItemIndex, challenge);
          } else {
             handleCompleteChallenge(challenge.id, challenge.points);
             alert('Validation successful! Points awarded.');
          }
        } else {
          alert('Validation failed. The image did not match the requirements. Please try again.');
        }
      } catch (error) {
        console.error("Error validating image:", error);
        alert("An error occurred during validation.");
      } finally {
        setValidatingChallengeId(null);
      }
    }, [handleCompleteChallenge, handleScavengerItemComplete, validatingChallengeId]);

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
                    <div className="p-4 md:p-8"><AdminPanel users={users} setUsers={setUsers} challenges={challenges} setChallenges={setChallenges} perks={perks} setPerks={setPerks} deals={deals} setDeals={setDeals} vehicles={vehicles} setVehicles={setVehicles} themeSettings={themeSettings} setThemeSettings={setThemeSettings} onExit={() => setIsAdminView(false)} onLogout={handleLogout} iconMap={iconMap} onSave={handleManualSaveConfig} /></div>
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