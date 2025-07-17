declare module 'react-fancy-qrcode' {
  import React from 'react';

  interface QRCodeProps {
    value: string;
    size?: number;
    backgroundColor?: string;
    color?: string;
    errorCorrection?: 'L' | 'M' | 'Q' | 'H';
    logo?: string;
    logoSize?: number;
    margin?: number;
    dotScale?: number;
    dotRadius?: string | number;
    positionRadius?: string | number | Array<string | number>;
    positionColor?: string;
    [key: string]: unknown;
  }

  const QRCode: React.FC<QRCodeProps>;
  export default QRCode;
} 