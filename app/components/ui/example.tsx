'use client';

import React from 'react';
import { NeoBrutalStyle } from './neobrutalism-style';
import { Button } from './button';

export const NeoBrutalismExample = () => {
    return (
        <div className="p-8 space-y-8">
            <h2 className="text-2xl font-bold mb-4">Neobrutalism Components</h2>

            <div className="space-y-4">
                <h3 className="text-xl font-bold">Buttons</h3>
                <div className="flex flex-wrap gap-4">
                    <Button variant="primary">Primary Button</Button>
                    <Button variant="secondary">Secondary Button</Button>
                    <Button variant="neutral">Neutral Button</Button>
                    <Button variant="destructive">Destructive Button</Button>
                    <Button variant="outline">Outline Button</Button>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold">NeoBrutalStyle Wrappers</h3>
                <div className="flex flex-wrap gap-4">
                    <NeoBrutalStyle className="p-4">
                        <p>Default NeoBrutalStyle</p>
                    </NeoBrutalStyle>

                    <NeoBrutalStyle className="p-4 bg-pink-500 text-white" rounded="full">
                        <p>Rounded Full</p>
                    </NeoBrutalStyle>

                    <NeoBrutalStyle className="p-4" interactive={false}>
                        <p>Non-interactive</p>
                    </NeoBrutalStyle>

                    <NeoBrutalStyle className="p-4 bg-blue-500 text-white" as="button" onClick={() => alert('Clicked!')}>
                        Custom Button Element
                    </NeoBrutalStyle>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold">Applying to Custom Components</h3>
                <NeoBrutalStyle className="p-6">
                    <div className="flex flex-col gap-4">
                        <h4 className="text-lg font-bold">Card Title</h4>
                        <p>This demonstrates how the NeoBrutalStyle component can wrap any content.</p>
                        <div className="flex gap-2">
                            <Button variant="primary" size="sm">Action</Button>
                            <Button variant="neutral" size="sm">Cancel</Button>
                        </div>
                    </div>
                </NeoBrutalStyle>
            </div>
        </div>
    );
}; 