import React, { useState } from 'react';
import { GoogleIcon, FacebookIcon, InstagramIcon, SpinnerIcon } from './Icons';

type Provider = 'Google' | 'Facebook' | 'Instagram';

interface SocialLoginSimulationProps {
  provider: Provider;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

const providerDetails = {
  Google: {
    icon: <GoogleIcon className="w-6 h-6" />,
    color: '#4285F4',
  },
  Facebook: {
    icon: <FacebookIcon className="w-6 h-6" />,
    color: '#1877F2',
  },
  Instagram: {
    icon: <InstagramIcon className="w-6 h-6" />,
    color: '#E4405F',
  },
};

export const SocialLoginSimulation: React.FC<SocialLoginSimulationProps> = ({ provider, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const details = providerDetails[provider];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter an email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email address.");
        return;
    }
    
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      onSuccess(email);
    }, 1500);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="inline-block p-3 rounded-full bg-slate-700 mb-4">
            {details.icon}
          </div>
          <h2 className="text-xl font-bold text-white">Sign in with {provider}</h2>
          <p className="text-sm text-slate-400 mt-1">Enter your details to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="sim-email" className="sr-only">Email</label>
            <input
              id="sim-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2"
              style={{ borderColor: error ? '#f87171' : '', '--ring-color': details.color } as any}
              onFocus={(e) => e.target.style.borderColor = details.color}
              onBlur={(e) => e.target.style.borderColor = error ? '#f87171' : ''}
              placeholder="Email address"
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="sim-password" className="sr-only">Password</label>
            <input
              id="sim-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2"
              style={{ '--ring-color': details.color } as any}
              onFocus={(e) => e.target.style.borderColor = details.color}
              onBlur={(e) => e.target.style.borderColor = ''}
              placeholder="Password (for simulation)"
            />
          </div>
          
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-full shadow-lg text-sm font-bold text-white transition-opacity disabled:opacity-70"
            style={{ backgroundColor: details.color }}
          >
            {isLoading ? (
              <>
                <SpinnerIcon className="w-5 h-5 mr-2" />
                Signing In...
              </>
            ) : `Sign In`}
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-4 text-center">This is a simulated login. Your password is not stored.</p>
      </div>
    </div>
  );
};