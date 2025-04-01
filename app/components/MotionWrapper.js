'use client';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function MotionWrapper({ children }) {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const handleStart = () => setIsLoading(true);
        const handleComplete = () => setIsLoading(false);

        return () => {
        };
    }, []);

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{
                    opacity: isLoading ? 0.6 : 1,
                    y: 0,
                    scale: isLoading ? 0.98 : 1
                }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1]
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}