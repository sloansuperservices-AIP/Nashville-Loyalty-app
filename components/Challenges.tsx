import React, { useRef, useState } from 'react';
import { Challenge, ChallengeType, ThemeSettings, User } from '../types';
import { CameraIcon, SpinnerIcon, VideoCameraIcon, CloseIcon, PlayCircleIcon, MapPinIcon } from './Icons';

interface ChallengesProps {
  user: User;
  challenges: Challenge[];
  completedChallengeIds: Set<number>;
  onCompleteChallenge: (challengeId: number, points: number) => void;
  validatingChallengeId: number | null;
  onImageSubmit: (challenge: Challenge, file: File, scavengerItemIndex?: number, scavengerItemDescription?: string) => void;
  onQrScanStart: (challenge: Challenge) => void;
  iconMap: { [key: string]: React.ReactNode };
  themeSettings: ThemeSettings;
}

// Helper to determine card style based on challenge ID or Type to match the poster aesthetic
const getCardStyle = (challenge: Challenge) => {
    // School of Rock / Hall of Famer -> Blue/Teal Theme
    if (challenge.venueName.toUpperCase().includes('SCHOOL') || challenge.venueName.toUpperCase().includes('HALL OF FAMER') || challenge.venueName.toUpperCase().includes('EYE OF THE TIGER')) {
        return {
            bg: 'bg-[#d8f3dc]', // Light Teal/Green paper
            border: 'border-[#1b4332]', // Dark Green
            header: 'text-[#1b4332]',
            accent: '#2d6a4f',
            iconColor: '#2d6a4f'
        };
    }
    // Gibson / Topgolf -> Gold Theme
    if (challenge.venueName.toUpperCase().includes('GIBSON') || challenge.venueName.toUpperCase().includes('TOPGOLF')) {
         return {
            bg: 'bg-[#fff8e1]', // Light Gold/Yellow paper
            border: 'border-[#f59e0b]', // Amber
            header: 'text-[#92400e]', // Brown/Amber
            accent: '#d97706',
            iconColor: '#d97706'
        };
    }
    // Karaoke -> Red Theme
    if (challenge.venueName.toUpperCase().includes('KARAOKE')) {
         return {
            bg: 'bg-[#fee2e2]', // Light Red paper
            border: 'border-[#b91c1c]', // Red
            header: 'text-[#991b1b]', // Dark Red
            accent: '#ef4444',
            iconColor: '#b91c1c'
        };
    }
    // Default -> White/Slate
    return {
        bg: 'bg-[#f8fafc]',
        border: 'border-slate-600',
        header: 'text-slate-800',
        accent: '#475569',
        iconColor: '#475569'
    };
};

export const Challenges: React.FC<ChallengesProps> = ({ 
  user,
  challenges, 
  completedChallengeIds, 
  onCompleteChallenge,
  validatingChallengeId,
  onImageSubmit,
  onQrScanStart,
  iconMap,
  themeSettings
}) => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const challengeForMedia = useRef<Challenge | null>(null);
  const scavengerContext = useRef<{index: number, description: string} | null>(null);

  const handleCardClick = (challenge: Challenge) => {
      setSelectedChallenge(challenge);
  };

  const closeModal = () => {
      setSelectedChallenge(null);
  };

  const handleUploadClick = (challenge: Challenge, scavengerItemIndex?: number, scavengerItemDescription?: string) => {
    challengeForMedia.current = challenge;
    if (scavengerItemIndex !== undefined && scavengerItemDescription) {
        scavengerContext.current = { index: scavengerItemIndex, description: scavengerItemDescription };
    } else {
        scavengerContext.current = null;
    }
    fileInputRef.current?.click();
  };

  const handleCameraClick = (challenge: Challenge, scavengerItemIndex?: number, scavengerItemDescription?: string) => {
    challengeForMedia.current = challenge;
    if (scavengerItemIndex !== undefined && scavengerItemDescription) {
        scavengerContext.current = { index: scavengerItemIndex, description: scavengerItemDescription };
    } else {
        scavengerContext.current = null;
    }
    cameraInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const challenge = challengeForMedia.current;

    if (file && challenge) {
      if (challenge.type === ChallengeType.Video) {
        onCompleteChallenge(challenge.id, challenge.points);
        alert('Video submitted! Points awarded.');
      } else {
         if (scavengerContext.current) {
             onImageSubmit(challenge, file, scavengerContext.current.index, scavengerContext.current.description);
         } else {
             onImageSubmit(challenge, file);
         }
      }
    }
    // Reset input value to allow re-uploading the same file
    if (event.target) {
        event.target.value = '';
    }
    challengeForMedia.current = null;
    scavengerContext.current = null;
  };

  const handleBookingRequest = (challenge: Challenge) => {
    if (!challenge.bookingEmail) return;

    const guestName = user.email.split('@')[0];
    const subject = `AIP Booking Request - ${guestName}`;
    const body = `Hi,\n\nI'd like to request a booking for the ${challenge.venueName}.\n\nPlease let me know the available dates.\n\nThanks,\n${guestName}`;
    const mailtoLink = `mailto:${challenge.bookingEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open email client
    window.location.href = mailtoLink;

    // Complete challenge immediately
    onCompleteChallenge(challenge.id, challenge.points);
  };

  // Render the Modal Actions (Buttons)
  const renderModalActions = (challenge: Challenge) => {
      const isCompleted = completedChallengeIds.has(challenge.id);
      const isValidating = validatingChallengeId === challenge.id;
      const isScavengerHunt = challenge.type === ChallengeType.SCAVENGER_HUNT;

      if (isCompleted && !isScavengerHunt) {
          return (
              <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center font-bold border border-green-500">
                  CHALLENGE COMPLETED
              </div>
          );
      }

      const baseButtonClasses = "w-full py-3 font-bold rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-2";
      const primaryButtonClasses = "text-white";
      const secondaryButtonClasses = "bg-slate-200 text-slate-800 hover:bg-slate-300";
      const disabledClasses = "bg-slate-300 text-slate-500 cursor-not-allowed";

      if (isValidating && !isScavengerHunt) {
        return (
           <button disabled className={`${baseButtonClasses} ${disabledClasses}`}>
              <SpinnerIcon className="w-5 h-5 mr-2" />
              Validating...
           </button>
        );
      }

      if (isScavengerHunt && challenge.scavengerHuntItems) {
          return (
              <div className="space-y-3">
                   <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">Checklist:</p>
                   {challenge.scavengerHuntItems.map((item, index) => {
                       const completedItems = user.scavengerHuntProgress?.[challenge.id] || [];
                       const isItemDone = completedItems.includes(index);
                       return (
                           <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md border border-slate-200 shadow-sm">
                               <span className={`text-sm ${isItemDone ? 'text-green-600 line-through' : 'text-slate-800'}`}>{item}</span>
                               {isItemDone ? (
                                   <span className="text-green-600 text-xs font-bold px-2 py-1 bg-green-100 rounded">DONE</span>
                               ) : (
                                   <div className="flex space-x-2">
                                     {isValidating && validatingChallengeId === challenge.id && scavengerContext.current?.index === index ? (
                                         <SpinnerIcon className="w-5 h-5 text-slate-500" />
                                     ) : (
                                         <button onClick={() => handleCameraClick(challenge, index, item)} style={{backgroundColor: themeSettings.primaryColor}} className="p-2 rounded-full text-white shadow hover:opacity-90">
                                            <CameraIcon className="w-4 h-4" />
                                          </button>
                                     )}
                                   </div>
                               )}
                           </div>
                       );
                   })}
                   <div className="mt-4 text-center text-xs text-slate-500">
                      Find all items to complete the challenge!
                   </div>
              </div>
          );
      }

      switch (challenge.type) {
          case ChallengeType.Receipt:
          case ChallengeType.Photo:
          case ChallengeType.Social:
              return (
                  <div className="space-y-3">
                      {challenge.type === ChallengeType.Social && challenge.socialUrl && (
                           <a href={challenge.socialUrl} target="_blank" rel="noopener noreferrer" className={`${baseButtonClasses} ${secondaryButtonClasses}`}>
                               Open Social App
                           </a>
                      )}
                      <button onClick={() => handleCameraClick(challenge)} style={{ backgroundColor: themeSettings.primaryColor }} className={`${baseButtonClasses} ${primaryButtonClasses}`}>
                          <CameraIcon className="w-5 h-5" />
                          <span>Take Photo</span>
                      </button>
                      <button onClick={() => handleUploadClick(challenge)} className={`${baseButtonClasses} ${secondaryButtonClasses}`}>
                          Upload from Gallery
                      </button>
                  </div>
              );
          case ChallengeType.Video:
              return (
                   <div className="space-y-3">
                      <button onClick={() => handleCameraClick(challenge)} style={{ backgroundColor: themeSettings.primaryColor }} className={`${baseButtonClasses} ${primaryButtonClasses}`}>
                          <VideoCameraIcon className="w-5 h-5" />
                          <span>Record Video</span>
                      </button>
                      <button onClick={() => handleUploadClick(challenge)} className={`${baseButtonClasses} ${secondaryButtonClasses}`}>
                          Upload Video
                      </button>
                  </div>
              );
          case ChallengeType.Booking:
              return <button onClick={() => handleBookingRequest(challenge)} style={{ backgroundColor: themeSettings.primaryColor }} className={`${baseButtonClasses} ${primaryButtonClasses}`}>Request to Book</button>;
          case ChallengeType.QR_CODE:
              return <button onClick={() => onQrScanStart(challenge)} style={{ backgroundColor: themeSettings.primaryColor }} className={`${baseButtonClasses} ${primaryButtonClasses}`}>Scan QR Code</button>;
          case ChallengeType.GPS:
          default:
              return <button onClick={() => onCompleteChallenge(challenge.id, challenge.points)} style={{ backgroundColor: themeSettings.primaryColor }} className={`${baseButtonClasses} ${primaryButtonClasses}`}>Check-In Here</button>;
      }
  }


  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Hidden Inputs for File/Camera */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp, video/mp4, video/quicktime" />
      <input type="file" ref={cameraInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" capture />

      <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 mb-8 uppercase tracking-widest" style={{ fontFamily: themeSettings.fontFamily }}>
          Legendary Challenges
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {challenges.map(challenge => {
          const isCompleted = completedChallengeIds.has(challenge.id);
          const style = getCardStyle(challenge);

          return (
            <div 
                key={challenge.id} 
                onClick={() => handleCardClick(challenge)}
                className={`relative group cursor-pointer rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.02] border-4 ${style.border} ${style.bg}`}
            >
              {/* Card Header Band */}
              <div className={`p-4 border-b-2 ${style.border} bg-opacity-10 bg-black flex justify-between items-center`}>
                  <div className="flex items-center space-x-3">
                       <div style={{color: style.iconColor}}>{iconMap[challenge.iconName]}</div>
                       <h3 className={`font-bold text-xl uppercase leading-tight ${style.header}`}>{challenge.venueName}</h3>
                  </div>
                  {isCompleted && <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">COMPLETED</div>}
              </div>

              {/* Card Body */}
              <div className="p-5 text-slate-800">
                  <p className="font-serif text-sm leading-relaxed opacity-80 mb-4 line-clamp-3">{challenge.description}</p>
                  
                  {/* Decorative Progress Bar Line */}
                  <div className="relative h-1 w-full bg-slate-300 rounded-full mt-6 mb-2">
                      <div className={`absolute left-0 top-0 h-full rounded-full ${isCompleted ? 'w-full' : 'w-1/3'}`} style={{ backgroundColor: style.accent }}></div>
                      <div className="absolute -top-1.5 left-0 w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: style.accent }}></div>
                      <div className={`absolute -top-1.5 ${isCompleted ? 'right-0' : 'left-1/3'} w-4 h-4 rounded-full border-2 border-white`} style={{ backgroundColor: style.accent }}></div>
                  </div>

                  {/* Play Button & Points */}
                  <div className="flex justify-between items-end mt-4">
                      <div className="transform transition-transform group-hover:scale-110" style={{ color: style.accent }}>
                          <PlayCircleIcon className="w-10 h-10" />
                      </div>
                      <div className="text-right">
                          <span className="text-xs font-bold text-slate-500 uppercase">Reward</span>
                          <p className="text-2xl font-black" style={{ color: style.accent }}>+{challenge.points} TC</p>
                      </div>
                  </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedChallenge && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={closeModal}>
              <div 
                  className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0 ${getCardStyle(selectedChallenge).bg}`} 
                  onClick={e => e.stopPropagation()}
              >
                  {/* Modal Header */}
                  <div className={`sticky top-0 z-10 flex justify-between items-start p-6 border-b ${getCardStyle(selectedChallenge).border} bg-white/50 backdrop-blur-md`}>
                      <div className="pr-8">
                           <h2 className={`text-2xl font-bold uppercase leading-none ${getCardStyle(selectedChallenge).header}`}>
                               {selectedChallenge.venueName}
                           </h2>
                           <p className="text-sm font-bold opacity-60 mt-1">{selectedChallenge.type.replace('_', ' ')} Challenge</p>
                      </div>
                      <button onClick={closeModal} className="absolute top-4 right-4 p-2 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors">
                          <CloseIcon className="w-6 h-6 text-slate-700" />
                      </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6">
                      {/* Description Box */}
                      <div className="bg-white/60 p-4 rounded-lg border border-slate-200 mb-6">
                          <p className="text-slate-800 font-medium text-lg mb-2">Mission:</p>
                          <p className="text-slate-600 leading-relaxed">{selectedChallenge.description}</p>
                          {selectedChallenge.address && (
                              <div className="flex items-center mt-3 text-slate-500 text-sm">
                                  <MapPinIcon className="w-4 h-4 mr-1" />
                                  {selectedChallenge.address}
                              </div>
                          )}
                      </div>

                      {/* Rewards Section */}
                      <div className="flex items-center justify-between mb-8 px-2">
                           <div>
                               <p className="text-xs font-bold text-slate-500 uppercase">XP Reward</p>
                               <p className="text-3xl font-black" style={{color: getCardStyle(selectedChallenge).accent}}>
                                   {selectedChallenge.points} PTS
                               </p>
                           </div>
                           {/* Badge logic for high points */}
                           {selectedChallenge.points >= 150 && (
                               <div className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-sm animate-pulse">
                                   LEGENDARY REWARD
                               </div>
                           )}
                      </div>

                      {/* Action Area */}
                      <div className="bg-white p-4 rounded-xl shadow-inner border border-slate-200">
                          {renderModalActions(selectedChallenge)}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};