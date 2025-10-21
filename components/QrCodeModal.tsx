import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { PartnerDeal, ThemeSettings } from '../types';
import { CloseIcon } from './Icons';

interface QrCodeModalProps {
  deal: PartnerDeal;
  onClose: () => void;
  onScan: () => void;
  themeSettings: ThemeSettings;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ deal, onClose, onScan, themeSettings }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && deal.qrCodeData) {
      QRCode.toCanvas(canvasRef.current, deal.qrCodeData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#FFFFFF', // White dots
          light: '#00000000' // Transparent background
        }
      }, (error) => {
        if (error) console.error(error);
      });
    }
  }, [deal.qrCodeData]);

  // Handle Escape key press and trigger scan
  useEffect(() => {
    onScan(); // Trigger scan count when modal is opened

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onScan]);

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-code-title"
    >
      <div 
        className="relative w-full max-w-sm bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 text-center"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Close QR code modal"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <h2 id="qr-code-title" className="text-2xl font-bold mb-2" style={{color: themeSettings.secondaryColor}}>{deal.name}</h2>
        <p className="text-slate-300 mb-6">{deal.description}</p>
        
        <div className="bg-slate-700/50 p-4 rounded-lg inline-block">
            <canvas ref={canvasRef} />
        </div>

        <p className="text-xs text-slate-500 mt-6">Show this code to the cashier to redeem your offer.</p>
      </div>
    </div>
  );
};