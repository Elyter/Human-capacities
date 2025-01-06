'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Liste de mots français courants
const MOTS_FRANCAIS = [
  'maison', 'voiture', 'chat', 'chien', 'table', 'livre', 'arbre', 'soleil',
  'lune', 'étoile', 'fleur', 'oiseau', 'pain', 'eau', 'café', 'musique',
  'temps', 'amour', 'travail', 'famille', 'ami', 'ville', 'pays', 'monde',
  'jardin', 'école', 'plage', 'montagne', 'cuisine', 'téléphone', 'ordinateur', 'fenêtre',
  'porte', 'route', 'train', 'avion', 'vélo', 'radio', 'journal', 'lettre',
  'histoire', 'film', 'photo', 'danse', 'chanson', 'pluie', 'neige', 'vent',
  'forêt', 'mer', 'rivière', 'lac', 'nuage', 'orage', 'matin', 'soir',
  'nuit', 'hiver', 'été', 'printemps', 'automne', 'fruit', 'légume', 'viande',
  'poisson', 'fromage', 'gâteau', 'chocolat', 'sucre', 'sel', 'restaurant', 'hôtel'
];

export default function VerbalMemoryTest() {
  const [motsDejaProposes, setMotsDejaProposes] = useState<Set<string>>(new Set());
  const [motCourant, setMotCourant] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [vies, setVies] = useState<number>(3);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'gameover'>('waiting');

  const choisirNouveauMot = () => {
    const utiliserMotDejaVu = Math.random() > 0.5 && motsDejaProposes.size > 0;
    
    if (utiliserMotDejaVu) {
      const motsArray = Array.from(motsDejaProposes);
      const motAleatoire = motsArray[Math.floor(Math.random() * motsArray.length)];
      setMotCourant(motAleatoire);
    } else {
      const motsDisponibles = MOTS_FRANCAIS.filter(mot => !motsDejaProposes.has(mot));
      if (motsDisponibles.length === 0) return;
      
      const nouveauMot = motsDisponibles[Math.floor(Math.random() * motsDisponibles.length)];
      setMotCourant(nouveauMot);
    }
  };

  const handleReponse = (dejaVu: boolean) => {
    const estEffectivementDejaVu = motsDejaProposes.has(motCourant);
    
    if ((dejaVu && estEffectivementDejaVu) || (!dejaVu && !estEffectivementDejaVu)) {
      setScore(prev => prev + 1);
      if (!estEffectivementDejaVu) {
        setMotsDejaProposes(prev => new Set(prev).add(motCourant));
      }
    } else {
      setVies(prev => prev - 1);
      if (vies <= 1) {
        setGameStatus('gameover');
        return;
      }
    }
    
    choisirNouveauMot();
  };

  const startGame = () => {
    setGameStatus('playing');
    setScore(0);
    setVies(3);
    setMotsDejaProposes(new Set());
    choisirNouveauMot();
  };

  return (
    <>
      <Link 
        href="/"
        className="fixed top-4 left-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors z-50"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </Link>

      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {gameStatus === 'waiting' ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Test de Mémoire Verbale</h1>
            <p className="mb-8">Mémorisez les mots et indiquez si vous les avez déjà vus ou non.</p>
            <button 
              onClick={startGame}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Commencer
            </button>
          </div>
        ) : gameStatus === 'playing' ? (
          <div className="text-center">
            <div className="mb-8">
              <div className="text-sm mb-2">Score: {score}</div>
              <div className="text-sm">Vies: {'❤️'.repeat(vies)}</div>
            </div>
            
            <div className="text-4xl font-bold mb-8">{motCourant}</div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => handleReponse(true)}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                DÉJÀ VU
              </button>
              <button 
                onClick={() => handleReponse(false)}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                NOUVEAU
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Partie terminée !</h2>
            <p className="text-xl mb-8">Score final : {score}</p>
            <button 
              onClick={startGame}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Rejouer
            </button>
          </div>
        )}
      </div>
    </>
  );
} 