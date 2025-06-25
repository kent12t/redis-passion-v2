'use client';

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from './dialog';
import MotionButton from './motion-button';

// QR Code component - we'll use a simple fallback if react-fancy-qrcode doesn't work
interface QRCodeProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
}

function SimpleQRCode({ value, size = 200 }: QRCodeProps) {
  return (
    <div className="flex items-center justify-center">
      <div 
        className="bg-white p-4 rounded-lg border-2 border-gray-200"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`}
          alt="QR Code"
          className="w-full h-full"
        />
      </div>
    </div>
  );
}

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  personalityType: string;
}

export default function QRModal({ isOpen, onClose, imageUrl, personalityType }: QRModalProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gray-900">
            Scan to View Your Result! 📱
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Scan the QR code with your phone to view your <span className="font-semibold">{personalityType}</span> result
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-8">
          {/* QR Code */}
          <SimpleQRCode value={imageUrl} size={250} />
          
          {/* Instructions */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              Use your phone&apos;s camera or QR scanner app
            </p>
            <p className="text-xs text-gray-400">
              The image will open in your browser
            </p>
          </div>
        </div>

        <div className="flex justify-center pb-4">
          <MotionButton
            onClick={onClose}
            variant="primary"
            className="px-8 py-2 bg-gray-500 hover:bg-gray-600 text-white"
          >
            Close
          </MotionButton>
        </div>
      </DialogContent>
    </Dialog>
  );
} 