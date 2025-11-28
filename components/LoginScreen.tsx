import React, { useState } from 'react';
import { User, ThemeSettings, Role } from '../types';
import { SocialLoginSimulation } from './SocialLoginSimulation';

interface LoginScreenProps {
  onAdminLogin: (email: string, password: string) => boolean;
  onSocialLogin: (email: string) => void;
  users: User[]; // for demo purposes to show available users
  themeSettings: ThemeSettings;
  iconMap: { [key: string]: React.ReactNode };
}

type Provider = 'Google' | 'Facebook' | 'Instagram';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onAdminLogin, onSocialLogin, users, themeSettings, iconMap }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginMode, setLoginMode] = useState<'guest' | 'admin'>('guest');
  const [simulatingProvider, setSimulatingProvider] = useState<Provider | null>(null);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onAdminLogin(email, password);
    if (!success) {
      setError('Invalid admin email or password.');
    }
  };
  
  const handleSocialClick = (provider: Provider) => {
    setError('');
    setSimulatingProvider(provider);
  }

  const handleSimulationSuccess = (simulatedEmail: string) => {
    onSocialLogin(simulatedEmail);
    setSimulatingProvider(null);
  };

  const demoAdmin = users.find(u => u.role === Role.Admin);

  const appStyle: React.CSSProperties = {
        fontFamily: themeSettings.fontFamily,
    };

    if (themeSettings.backgroundImage) {
        appStyle.backgroundImage = `url(${themeSettings.backgroundImage})`;
        appStyle.backgroundSize = 'cover';
        appStyle.backgroundPosition = 'center';
        appStyle.backgroundAttachment = 'fixed';
    }
    
    const SocialButton: React.FC<{provider: Provider, bgColor: string, hoverBgColor: string}> = ({ provider, bgColor, hoverBgColor }) => (
        <button 
            type="button" 
            onClick={() => handleSocialClick(provider)}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-sm font-bold text-white transition-colors"
            style={{ backgroundColor: bgColor }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = hoverBgColor}
            onMouseOut={e => e.currentTarget.style.backgroundColor = bgColor}
        >
            <span className="mr-2">{iconMap[provider]}</span>
            Sign in with {provider}
        </button>
    );

  return (
    <>
      <div style={appStyle} className={`min-h-screen ${!themeSettings.backgroundImage ? 'bg-slate-900' : ''} text-slate-100 flex flex-col items-center justify-center p-4`}>
          <div className={`w-full max-w-md ${themeSettings.backgroundImage ? 'bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8' : ''}`}>
              <header className="text-center mb-8">
                  <h1 style={{ backgroundImage: `linear-gradient(to right, ${themeSettings.primaryColor}, ${themeSettings.secondaryColor})` }} className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text tracking-wide">
                      {themeSettings.headerText}
                  </h1>
                  <p className="text-slate-400">{themeSettings.subHeaderText}</p>
              </header>

              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl p-8">
                  {loginMode === 'guest' ? (
                      <>
                          <h2 className="text-2xl font-bold text-center text-white mb-6">Guest Sign-In</h2>
                          <div className="space-y-4">
                              <SocialButton provider="Google" bgColor="#4285F4" hoverBgColor="#3578E5" />
                              <SocialButton provider="Facebook" bgColor="#1877F2" hoverBgColor="#166FE5" />
                              {/* Instagram-style gradient button */}
                              <button 
                                  type="button" 
                                  onClick={() => handleSocialClick('Instagram')}
                                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-sm font-bold text-white transition-opacity bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90"
                              >
                                  <span className="mr-2">{iconMap['Instagram']}</span>
                                  Sign in with Instagram
                              </button>
                              {error && <p className="text-red-400 text-sm text-center pt-2">{error}</p>}
                          </div>
                          <div className="mt-6 text-center">
                              <button onClick={() => setLoginMode('admin')} className="text-sm text-slate-400 hover:text-white transition-colors">
                                  Admin Login
                              </button>
                          </div>
                      </>
                  ) : (
                      <>
                          <h2 className="text-2xl font-bold text-center text-white mb-6">Admin Login</h2>
                          <form onSubmit={handleAdminSubmit} className="space-y-6">
                              <div>
                                  <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email</label>
                                  <input
                                      type="email"
                                      id="email"
                                      value={email}
                                      onChange={(e) => setEmail(e.target.value)}
                                      className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2"
                                      style={{'--ring-color': themeSettings.primaryColor} as any}
                                      onFocus={(e) => e.target.style.borderColor = themeSettings.primaryColor}
                                      onBlur={(e) => e.target.style.borderColor = ''}
                                      required
                                  />
                              </div>
                              <div>
                                  <label htmlFor="password"  className="block text-sm font-medium text-slate-300">Password</label>
                                  <input
                                      type="password"
                                      id="password"
                                      value={password}
                                      onChange={(e) => setPassword(e.target.value)}
                                      className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2"
                                      style={{'--ring-color': themeSettings.primaryColor} as any}
                                      onFocus={(e) => e.target.style.borderColor = themeSettings.primaryColor}
                                      onBlur={(e) => e.target.style.borderColor = ''}
                                      required
                                  />
                              </div>

                              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                              <div>
                                  <button type="submit" style={{backgroundColor: themeSettings.primaryColor}} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-sm font-bold text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors">
                                      Enter Admin Panel
                                  </button>
                              </div>
                          </form>
                          <div className="mt-6 text-center">
                              <button onClick={() => setLoginMode('guest')} className="text-sm text-slate-400 hover:text-white transition-colors">
                                  Back to Guest Sign-In
                              </button>
                          </div>
                      </>
                  )}
              </div>
              
              {demoAdmin && loginMode === 'admin' && (
                   <div className="mt-8 text-center text-slate-500 text-sm max-w-md">
                      <p className="font-semibold mb-2">Demo Admin Credentials:</p>
                      <div className="text-left inline-block">
                          <div>
                             <span className="font-mono" style={{color: themeSettings.secondaryColor}}>{demoAdmin.email}</span> / <span className="font-mono" style={{color: themeSettings.primaryColor}}>{demoAdmin.password}</span>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>
      {simulatingProvider && (
        <SocialLoginSimulation 
          provider={simulatingProvider}
          onClose={() => setSimulatingProvider(null)}
          onSuccess={handleSimulationSuccess}
        />
      )}
    </>
  );
};