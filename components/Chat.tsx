import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat as GenAIChat } from '@google/genai';
import { ChatBubbleIcon, CloseIcon } from './Icons';
import { ThemeSettings } from '../types';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

interface ChatProps {
    themeSettings: ThemeSettings;
}

export const Chat: React.FC<ChatProps> = ({ themeSettings }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { text: "Hey Rockstar! How can I help you on your tour today?", sender: 'ai' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<GenAIChat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const initializeChat = () => {
        if (!chatRef.current) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: 'You are a friendly and helpful customer support agent for the Rockstar Hospitality Pass application. You assist users with questions about their scavenger hunt challenges, how to earn points, unlock perks, and find partner locations. Your persona is a cool, knowledgeable roadie on a rock tour. Keep your answers concise, helpful, and with a bit of rock-n-roll flair.',
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
    
    return (
        <>
            <div className="fixed bottom-6 right-6 z-50">
                <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    style={{ backgroundColor: themeSettings.primaryColor }}
                    className="w-16 h-16 rounded-full text-white flex items-center justify-center shadow-lg hover:opacity-90 transition-all duration-300 transform hover:scale-110"
                    aria-label={isOpen ? "Close chat" : "Open chat support"}
                >
                    {isOpen ? <CloseIcon className="w-8 h-8" /> : <ChatBubbleIcon className="w-8 h-8" />}
                </button>
            </div>
            
            <div className={`fixed bottom-24 right-6 z-50 w-full max-w-sm h-[60vh] bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`} role="dialog" aria-hidden={!isOpen}>
                <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-700">
                    <h3 className="font-bold text-lg text-slate-100">Roadie Support</h3>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white" aria-label="Close chat">
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
        </>
    );
}