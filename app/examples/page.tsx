'use client';

import React from 'react';
import { NeoBrutalismExample } from '../components/ui/example';
import { Button } from '../components/ui/button';
import Link from 'next/link';

export default function ExamplesPage() {
    return (
        <div className="min-h-screen">
            <header className="flex justify-between items-center p-6 bg-white border-b-2 border-black">
                <h1 className="text-3xl font-bold">Neobrutalism Components</h1>
                <Link href="/">
                    <Button variant="neutral">Back to Homepage</Button>
                </Link>
            </header>

            <main>
                <NeoBrutalismExample />
            </main>
        </div>
    );
} 