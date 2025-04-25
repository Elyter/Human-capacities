'use client';
import React from 'react';

interface GameOverModalProps {
  isOpen: boolean;
  score?: number;
  onRestart: () => void;
  onBackToRules: () => void;
  scoreLabel?: string;
  showRestartButton?: boolean;
  showBackToRulesButton?: boolean;
}

export default function GameOverModal({
  isOpen,
  score,
  onRestart,
  onBackToRules,
  scoreLabel = "Niveau atteint",
  showRestartButton = true,
  showBackToRulesButton = true
}: GameOverModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl text-center">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Partie terminée !</h2>
        <p className="text-xl mb-6 dark:text-gray-200">{scoreLabel} : {score}</p>
        <div className="flex gap-4 justify-center">
          {showRestartButton && (
            <button 
              onClick={onRestart}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Rejouer
            </button>
          )}
          {showBackToRulesButton && (
            <button 
              onClick={onBackToRules}
              className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
            >
              Retour aux règles
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 