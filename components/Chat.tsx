import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat as GenAIChat } from '@google/genai';
import { CloseIcon } from './Icons';
import { ThemeSettings } from '../types';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

interface ChatProps {
    isOpen: boolean;
    onClose: () => void;
    themeSettings: ThemeSettings;
}

export const Chat: React.FC<ChatProps> = ({ isOpen, onClose, themeSettings }) => {
    const [messages, setMessages] = useState<Message[]>([
        { text: "Hey Rockstar! I'm Rocky, your personal roadie. How can I help you on your tour today?", sender: 'ai' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<GenAIChat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Focus input when chat opens
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const initializeChat = () => {
        if (!chatRef.current) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: "You're Rocky, the smart concierge for the Rockstar Hospitality Pass. Your persona is a cool, knowledgeable roadie on a rock tour. You help guests explore challenges, use their perks, book transportation, and discover exclusive partner perks. Keep your answers concise, helpful, and inject a bit of rock-n-roll flair into your responses. For example, use terms like 'gig', 'backstage pass', 'headliner', etc.",
                },
            });
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        initializeChat();

        const userMessage: Message = { text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        const currentInputValue = inputValue;
        setInputValue('');
        setIsLoading(true);

        try {
            const chat = chatRef.current;
            if (chat) {
                const response = await chat.sendMessage({ message: currentInputValue });
                const aiMessage: Message = { text: response.text, sender: 'ai' };
                setMessages(prev => [...prev, aiMessage]);
            }
        } catch (error) {
            console.error("Error sending message to Gemini:", error);
            const errorMessage: Message = { text: "Sorry, the tour bus hit a dead zone. My signal is weak. Please try again later.", sender: 'ai' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-[100] flex flex-col items-center justify-end md:justify-center p-0 md:p-4 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="w-full max-w-lg h-full md:h-[80vh] bg-slate-800/95 border-t-2 md:border-2 border-slate-700 rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col"
                style={{borderColor: themeSettings.primaryColor}}
            >
                <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-700">
                    <h3 className="font-bold text-lg text-slate-100">Rocky - AI Concierge</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close chat">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'text-white rounded-br-none' : 'bg-slate-600 text-slate-100 rounded-bl-none'}`}
                                 style={{ backgroundColor: msg.sender === 'user' ? themeSettings.primaryColor : undefined }}>
                                <p className="text-sm break-words">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex justify-start">
                            <div className="max-w-xs md:max-w-sm px-4 py-2 rounded-2xl bg-slate-600 text-slate-100 rounded-bl-none">
                                <p className="text-sm animate-pulse">...</p>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <footer className="flex-shrink-0 p-4 border-t border-slate-700">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask a question..."
                            className="flex-1 px-4 py-2 bg-slate-700 text-slate-100 rounded-full border border-slate-600 focus:outline-none focus:ring-2 disabled:opacity-50"
                            style={{'--ring-color': themeSettings.primaryColor} as any}
                            onFocus={(e) => e.target.style.borderColor = themeSettings.primaryColor}
                            onBlur={(e) => e.target.style.borderColor = ''}
                            disabled={isLoading}
                            aria-label="Chat message input"
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || !inputValue.trim()}
                            style={{ backgroundColor: themeSettings.primaryColor }}
                            className="px-5 py-2 text-white font-semibold rounded-full hover:opacity-90 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                            aria-label="Send message"
                        >
                            Send
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
}