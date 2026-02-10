'use client';

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from './dialog';
import MotionButton from './motion-button';

import Image from 'next/image';
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
  imageUrl: string | null;
  personalityType: string;
  previewImageUrl?: string | null;
}

export default function QRModal({ isOpen, onClose, imageUrl, personalityType, previewImageUrl }: QRModalProps) {

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
          {/* Local preview (instant, no network) */}
          {previewImageUrl ? (
            <div className="relative w-[240px] h-[240px] overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50">
              <Image
                src={previewImageUrl}
                alt="Result preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : null}

          {/* QR Code */}
          {imageUrl ? (
            <SimpleQRCode value={imageUrl} size={250} />
          ) : (
            <div className="flex flex-col items-center justify-center w-[250px] h-[250px] rounded-lg border-2 border-gray-200 bg-gray-50">
              <div className="w-10 h-10 rounded-full border-4 border-gray-700 animate-spin border-t-transparent"></div>
              <p className="mt-4 text-sm text-gray-600">Generating QR…</p>
            </div>
          )}
          
          {/* Instructions */}
          <div className="space-y-2 text-center">
            <p className="text-sm text-gray-500">
              Use your phone&apos;s camera or QR scanner app
            </p>
            <p className="text-xs text-gray-400">
              {imageUrl ? 'The image will open in your browser' : 'Waiting for upload URL…'}
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