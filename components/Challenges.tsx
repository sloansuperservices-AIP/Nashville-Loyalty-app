import React, { useRef } from 'react';
import { Challenge, ChallengeType, ThemeSettings, User } from '../types';
import { CameraIcon, SpinnerIcon, VideoCameraIcon } from './Icons';

interface ChallengesProps {
  user: User;
  challenges: Challenge[];
  completedChallengeIds: Set<number>;
  onCompleteChallenge: (challengeId: number, points: number) => void;
  validatingChallengeId: number | null;
  onImageSubmit: (challenge: Challenge, file: File) => void;
  onQrScanStart: (challenge: Challenge) => void;
  iconMap: { [key: string]: React.ReactNode };
  themeSettings: ThemeSettings;
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const challengeForMedia = useRef<Challenge | null>(null);

  const handleUploadClick = (challenge: Challenge) => {
    challengeForMedia.current = challenge;
    fileInputRef.current?.click();
  };

  const handleCameraClick = (challenge: Challenge) => {
    challengeForMedia.current = challenge;
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
        onImageSubmit(challenge, file);
      }
    }
    // Reset input value to allow re-uploading the same file
    if (event.target) {
        event.target.value = '';
    }
    challengeForMedia.current = null;
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


  return (
    <div className="w-full max-w-lg mx-auto bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold text-slate-100 mb-4">Available Challenges</h2>
      {/* Input for file picking */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp, video/mp4, video/quicktime"
        aria-label="Upload proof"
      />
      {/* Input for direct camera/video capture */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,video/*"
        capture
        aria-label="Capture with camera"
      />
      <div className="space-y-4">
        {challenges.map(challenge => {
          const isCompleted = completedChallengeIds.has(challenge.id);
          const isValidating = validatingChallengeId === challenge.id;

          const renderButtons = () => {
            const baseButtonClasses = "px-6 py-2 font-bold rounded-full shadow-lg transition-all duration-300 transform";
            const primaryButtonClasses = "text-white hover:opacity-90 hover:scale-105";
            const secondaryButtonClasses = "bg-slate-600 text-white hover:bg-slate-500 hover:scale-105"
            const disabledClasses = "bg-slate-600 text-slate-400 cursor-not-allowed flex items-center justify-center";

            if (isValidating) {
              return (
                 <button disabled className={`${baseButtonClasses} ${disabledClasses} w-40`}>
                    <SpinnerIcon className="w-5 h-5 mr-2" />
                    Validating...
                 </button>
              );
            }
            
            const mediaActions = (uploadText: string, icon: React.ReactNode) => (
              <div className="flex items-center justify-end space-x-3">
                  <button onClick={() => handleUploadClick(challenge)} style={{ backgroundColor: themeSettings.primaryColor }} className={`${baseButtonClasses} ${primaryButtonClasses}`}>{uploadText}</button>
                  <button onClick={() => handleCameraClick(challenge)} className={`${baseButtonClasses} ${secondaryButtonClasses} !p-3`} aria-label="Use Camera">{icon}</button>
              </div>
            );

            switch (challenge.type) {
                case ChallengeType.Receipt:
                    return mediaActions('Submit Receipt', <CameraIcon className="w-5 h-5" />);
                case ChallengeType.Photo:
                    return mediaActions('Submit Photo', <CameraIcon className="w-5 h-5" />);
                case ChallengeType.Video:
                    return mediaActions('Submit Video', <VideoCameraIcon className="w-5 h-5" />);
                case ChallengeType.Social:
                    return (
                        <div className="flex items-center justify-end space-x-3">
                            <a href={challenge.socialUrl} target="_blank" rel="noopener noreferrer" className={`${baseButtonClasses} ${secondaryButtonClasses}`}>Open Instagram</a>
                            <button onClick={() => handleUploadClick(challenge)} style={{ backgroundColor: themeSettings.primaryColor }} className={`${baseButtonClasses} ${primaryButtonClasses}`}>Submit Proof</button>
                            <button onClick={() => handleCameraClick(challenge)} className={`${baseButtonClasses} ${secondaryButtonClasses} !p-3`} aria-label="Take Screenshot"><CameraIcon className="w-5 h-5" /></button>
                        </div>
                    );
                case ChallengeType.Booking:
                    return <button onClick={() => handleBookingRequest(challenge)} style={{ backgroundColor: themeSettings.primaryColor }} className={`${baseButtonClasses} ${primaryButtonClasses}`}>Request to Book</button>;
                case ChallengeType.QR_CODE:
                    return <button onClick={() => onQrScanStart(challenge)} style={{ backgroundColor: themeSettings.primaryColor }} className={`${baseButtonClasses} ${primaryButtonClasses}`}>Scan Code</button>;
                case ChallengeType.GPS:
                default:
                    return <button onClick={() => onCompleteChallenge(challenge.id, challenge.points)} style={{ backgroundColor: themeSettings.primaryColor }} className={`${baseButtonClasses} ${primaryButtonClasses}`}>Complete</button>;
            }
          };

          return (
            <div key={challenge.id} className={`p-4 rounded-lg transition-all duration-300 ${isCompleted ? 'bg-green-500/10' : 'bg-slate-700/50'}`}>
              <div className="flex items-start">
                <div style={{color: themeSettings.primaryColor}} className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 bg-slate-600">
                  {iconMap[challenge.iconName]}
                </div>
                <div className="flex-grow">
                  <p className="font-bold text-slate-100">{challenge.venueName}</p>
                  <p className="text-sm text-slate-400 mt-1">{challenge.description}</p>
                </div>
                <div className="flex-shrink-0 text-right ml-4">
                  <p style={{color: themeSettings.primaryColor}} className="font-bold text-lg">+{challenge.points} TC</p>

                </div>
              </div>
              {!isCompleted && (
                <div className="mt-4 text-right">
                  {renderButtons()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};