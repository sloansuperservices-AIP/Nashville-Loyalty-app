import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { CloseIcon } from './Icons';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

const QR_SCANNER_ID = 'qr-code-reader';

export const QrScanner: React.FC<QrScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Ensure this only runs once
    if (!scannerRef.current) {
      const html5QrCode = new Html5Qrcode(QR_SCANNER_ID);
      scannerRef.current = html5QrCode;

      const startScanner = async () => {
        try {
          await html5QrCode.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText, decodedResult) => {
              // Stop the scanner immediately on success
              if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().then(() => {
                   onScanSuccess(decodedText);
                }).catch(err => {
                   console.error("Failed to stop scanner after success", err);
                   onScanSuccess(decodedText); // Still call success
                });
              }
            },
            (errorMessage) => {
              // Parse error, ignore.
            }
          );
        } catch (err) {
          console.error('Unable to start QR scanner', err);
          alert('Error: Could not start camera. Please grant camera permissions and try again.');
          onClose();
        }
      };

      startScanner();
    }
    
    // Cleanup function to stop the scanner when the component unmounts
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop()
          .then(() => console.log("QR Scanner stopped."))
          .catch(err => console.error("Failed to stop QR scanner.", err));
      }
    };
  }, [onScanSuccess, onClose]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      <div id={QR_SCANNER_ID} style={{ width: '100%', maxWidth: '500px' }}></div>
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black/30 rounded-full p-2 hover:bg-black/60 transition-colors"
        aria-label="Close scanner"
      >
        <CloseIcon className="w-8 h-8" />
      </button>
      <div className="absolute bottom-10 text-white bg-black/40 px-4 py-2 rounded-lg text-center">
        <p>Point your camera at a QR code</p>
      </div>
    </div>
  );
};
