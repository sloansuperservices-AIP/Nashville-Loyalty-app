import React, { useState } from 'react';
import { User, ThemeSettings } from '../types';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => boolean;
  users: User[]; // for demo purposes to show available users
  themeSettings: ThemeSettings;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, users, themeSettings }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onLogin(username, password);
    if (!success) {
      setError('Invalid username or password.');
    }
  };
  
  const demoUsers = users.map(u => ({ username: u.username, password: u.password }));

  const appStyle: React.CSSProperties = {
        fontFamily: themeSettings.fontFamily,
    };

    if (themeSettings.backgroundImage) {
        appStyle.backgroundImage = `url(${themeSettings.backgroundImage})`;
        appStyle.backgroundSize = 'cover';
        appStyle.backgroundPosition = 'center';
        appStyle.backgroundAttachment = 'fixed';
    }

  return (
    <div style={appStyle} className={`min-h-screen ${!themeSettings.backgroundImage ? 'bg-slate-900' : ''} text-slate-100 flex flex-col items-center justify-center p-4`}>
        <div className={`w-full max-w-md ${themeSettings.backgroundImage ? 'bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8' : ''}`}>
            <header className="text-center mb-8">
                <h1 style={{ backgroundImage: `linear-gradient(to right, ${themeSettings.primaryColor}, ${themeSettings.secondaryColor})` }} className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text tracking-wide">
                    {themeSettings.headerText}
                </h1>
                <p className="text-slate-400">{themeSettings.subHeaderText}</p>
            </header>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl p-8">
                <h2 className="text-2xl font-bold text-center text-white mb-6">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
{/* Fix: Replaced incorrect attribute `a` with the correct `htmlFor` attribute to associate the label with the input field. */}
                        <label htmlFor="username" className="block text-sm font-medium text-slate-300">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2"
                            style={{'--ring-color': themeSettings.primaryColor} as any}
                            onFocus={(e) => e.target.style.borderColor = themeSettings.primaryColor}
                            onBlur={(e) => e.target.style.borderColor = ''}
                            required
                        />
                    </div>
                    <div>
{/* Fix: Replaced incorrect attribute `a` with the correct `htmlFor` attribute to associate the label with the input field. */}
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
                            Enter the Venue
                        </button>
                    </div>
                </form>
            </div>
            
            <div className="mt-8 text-center text-slate-500 text-sm max-w-md">
                <p className="font-semibold mb-2">Demo Credentials:</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-left">
                    {demoUsers.map(u => (
                        <div key={u.username}>
                           <span className="font-mono" style={{color: themeSettings.secondaryColor}}>{u.username}</span> / <span className="font-mono" style={{color: themeSettings.primaryColor}}>{u.password}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    </div>
  );
};