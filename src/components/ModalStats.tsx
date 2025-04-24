'use client';

import { ReactNode } from 'react';

interface ModalStatsProps {
  children: ReactNode;
}

export default function ModalStats({ children }: ModalStatsProps) {
  return (
    <div className="w-[800px] max-w-[90vw] h-[400px] mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg overflow-auto">
      <h2 className="text-2xl font-bold mb-6 dark:text-white text-center">Statistiques</h2>
      <div className="h-[calc(100%-60px)]">
        {children}
      </div>
    </div>
  );
} 