'use client';

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from './dialog';
import MotionButton from './motion-button';

import QRCode from 'react-fancy-qrcode';

// QR Code component using react-fancy-qrcode
interface QRCodeProps {
  value: string;
  size?: number;
}

function SimpleQRCode({ value, size = 200 }: QRCodeProps) {
  return (
    <div className="flex justify-center items-center">
      <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
        <QRCode
          value={value}
          size={size}
          backgroundColor="#ffffff"
          color="#231f20"
          errorCorrection="M"
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
      <DialogContent className="bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gray-900">
            Scan to View Your Result! 📱
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Scan the QR code with your phone to view your <span className="font-semibold">{personalityType}</span> result
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-8 space-y-6">
          {/* QR Code */}
          <SimpleQRCode value={imageUrl} size={250} />
          
          {/* Instructions */}
          <div className="space-y-2 text-center">
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
            className="px-8 py-2 text-white bg-gray-500 hover:bg-gray-600"
          >
            Close
          </MotionButton>
        </div>
      </DialogContent>
    </Dialog>
  );
} 