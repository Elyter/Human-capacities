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
        className="fixed top-4 left-4 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors z-50"
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

      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        {gameStatus === 'waiting' ? (
          <div className="text-center max-w-md bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg mx-4">
            <h1 className="text-3xl font-bold mb-4">Test de Mémoire Verbale</h1>
            <p className="mb-4">
              Mémorisez les mots et indiquez si vous les avez déjà vus ou non.
            </p>
            <button 
              onClick={startGame}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Commencer
            </button>
          </div>
        ) : (
          <>
            <div className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-sm shadow-lg z-40">
              <div className="max-w-screen-xl mx-auto h-full flex items-center justify-center gap-8">
                <div className="text-2xl">Score: {score}</div>
                <div className="flex gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} className="text-2xl">
                      {i < (3 - vies) ? '🖤' : '❤️'}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-8 pt-24">
              <div className="text-4xl font-bold mb-8">{motCourant}</div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => handleReponse(true)}
                  className="px-8 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all hover:scale-105"
                >
                  DÉJÀ VU
                </button>
                <button 
                  onClick={() => handleReponse(false)}
                  className="px-8 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all hover:scale-105"
                >
                  NOUVEAU
                </button>
              </div>
            </div>
          </>
        )}

        {gameStatus === 'gameover' && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-4">Partie terminée !</h2>
              <p className="text-xl mb-6">Score final : {score}</p>
              <button 
                onClick={startGame}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                Rejouer
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 