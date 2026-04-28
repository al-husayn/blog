'use client';

import React from 'react';
import { List } from 'lucide-react';
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerFooter,
} from '@/components/ui/drawer';
import { TableOfContents } from '@/components/table-of-contents';
import { PromoContent } from '@/components/promo-content';

export function MobileTableOfContents() {
    return (
        <Drawer>
            <DrawerTrigger
                aria-label='Open table of contents'
                title='Table of contents'
                className='lg:hidden fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors'
            >
                <List size={20} aria-hidden='true' />
                <span className='sr-only'>Open table of contents</span>
            </DrawerTrigger>

            <DrawerContent className='lg:hidden'>
                <DrawerHeader>
                    <h3 className='font-semibold'>Table of Contents</h3>
                </DrawerHeader>

                <DrawerBody>
                    <TableOfContents />
                </DrawerBody>

                <DrawerFooter>
                    <PromoContent variant='mobile' />
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
