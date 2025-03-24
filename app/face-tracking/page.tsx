'use client';

import dynamic from 'next/dynamic';

// Dynamically import the FaceTracking component with no SSR
const FaceTracking = dynamic(() => import('../face-tracking'), {
    ssr: false,
});

export default function FaceTrackingPage() {
    return (
        <main>
            <FaceTracking />
        </main>
    );
} 