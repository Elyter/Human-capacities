'use client';

import { ReactNode, useRef } from 'react';
import ModalStats from './ModalStats';

interface StartModalProps {
  title: string;
  description: ReactNode;
  onStart: () => void;
  stats?: ReactNode;
}

export default function StartModal({ title, description, onStart, stats }: StartModalProps) {
  const statsRef = useRef<HTMLDivElement>(null);

  const scrollToStats = () => {
    statsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full">
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg mx-4">
          <h1 className="text-3xl font-bold mb-4 dark:text-white">{title}</h1>
          <div className="mb-8 dark:text-gray-200">
            {description}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              onClick={onStart}
            >
              Commencer
            </button>
            {stats && (
              <button 
                className="px-6 py-3 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={scrollToStats}
              >
                Voir les statistiques
              </button>
            )}
          </div>
        </div>
      </div>
      
      {stats && (
        <div 
          ref={statsRef} 
          id="stats-section"
          className="w-full py-20 mt-[100vh]"
        >
          <ModalStats>
            {stats}
          </ModalStats>
        </div>
      )}
    </div>
  );
} 