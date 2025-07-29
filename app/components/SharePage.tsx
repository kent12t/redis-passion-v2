'use client';

import MotionButton from './ui/motion-button';
import Image from 'next/image';
import QRCode from 'react-fancy-qrcode';
import { useLanguage } from '@/app/lib/text-utils';

// QR Code component using react-fancy-qrcode
interface QRCodeProps {
    value: string;
    size?: number;
}

function SimpleQRCode({ value, size = 200 }: QRCodeProps) {
  return (
    <div className="flex justify-center items-center">
      <div className="bg-transparent rounded-lg">
        <QRCode
          value={value}
          size={size}
          color="#231f20"
          backgroundColor="transparent"
          errorCorrection="M"
          logo="/aic-logo.png"
          logoSize={size * 0.3}
        />
      </div>
    </div>
  );
}

interface SharePageProps {
    imageUrl: string;
    onBack: () => void;
    onHome: () => void;
}

export default function SharePage({ imageUrl, onBack, onHome }: SharePageProps) {
    const { textContent } = useLanguage();

    return (
        <div className="overflow-hidden relative p-0 w-full h-full bg-midblue">
            {/* Title */}
            <div className="absolute top-32 left-1/2 z-20 w-full transform -translate-x-1/2">
                <h1 className="text-[64px] font-sans leading-tight text-center text-white">
                    {textContent.sharePage.title.split('\n').map((line, index, array) => (
                        <span key={index}>
                            {line}
                            {index < array.length - 1 && <br />}
                        </span>
                    ))}
                </h1>
            </div>

            {/* Rotated captured image */}
            <div className="flex absolute top-1/2 left-1/2 z-10 justify-center items-center w-full transform -translate-x-1/2 -translate-y-1/2">
                <div className="transform -rotate-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imageUrl}
                        alt="Your captured result"
                        className="w-[20dvw] h-auto rounded-[32px] border-4 border-black shadow-[-24px_24px_0px_0px_rgba(35,31,32,1)]"
                    />
                </div>
            </div>

            {/* Bottom overlay curve */}
            <div className="absolute bottom-0 left-0 z-10 p-0 w-full">
                <Image
                    src="/overlay-curve.svg"
                    alt="Curve overlay"
                    className="object-contain w-full h-full"
                    width={1920}
                    height={933}
                />
            </div>

            {/* Navigation buttons and QR code */}
            <div className="absolute bottom-0 left-0 right-0 z-20 pb-[150px] px-[10%] flex flex-col gap-10">
                <div className="flex justify-center items-center px-16">
                    {/* Back button */}
                    <div className="flex flex-1 justify-start">
                        <MotionButton
                            variant="primary"
                            className="flex justify-center items-center p-6 w-28 h-28 rounded-full bg-yellow"
                            onClick={onBack}
                        >
                            <Image
                                src="/icons/back.svg"
                                alt={textContent.common.altTexts.back}
                                width={64}
                                height={64}
                                className="w-16 h-16"
                            />
                        </MotionButton>
                    </div>

                    {/* QR Code centered */}
                    <div className="flex flex-col flex-1 justify-center">
                        <SimpleQRCode value={imageUrl} size={300} />
                    </div>

                    {/* Home button */}
                    <div className="flex flex-1 justify-end">
                        <MotionButton
                            variant="primary"
                            className="flex justify-center items-center p-6 w-28 h-28 rounded-full bg-yellow"
                            onClick={onHome}
                        >
                            <Image
                                src="/icons/home.svg"
                                alt={textContent.common.altTexts.home}
                                width={80}
                                height={80}
                                className="w-20 h-20"
                            />
                        </MotionButton>
                    </div>
                </div>

                <p className="w-full text-[40px] leading-tight font-sans text-center text-black">
                    {textContent.sharePage.downloadText.split('\n').map((line, index, array) => (
                        <span key={index}>
                            {line}
                            {index < array.length - 1 && <br />}
                        </span>
                    ))}
                </p>
            </div>
        </div>
    );
} 