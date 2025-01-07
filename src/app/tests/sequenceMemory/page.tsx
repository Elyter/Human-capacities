'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SequenceMemoryTest() {
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'showing' | 'gameover'>('waiting');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [correctTiles, setCorrectTiles] = useState<number[]>([]);
  const [errorTile, setErrorTile] = useState<number | null>(null);
  const [clickedTile, setClickedTile] = useState<number | null>(null);
  const [results, setResults] = useState<Array<{ timestamp: number; score: number }>>([]);

  const generateSequence = (currentLevel: number) => {
    if (currentLevel === 1) {
      // Au niveau 1, générer une nouvelle séquence avec une seule tuile
      return [Math.floor(Math.random() * 9)];
    } else {
      // Pour les niveaux suivants, ajouter une tuile à la séquence existante
      const newSequence = [...sequence];
      newSequence.push(Math.floor(Math.random() * 9));
      return newSequence;
    }
  };

  const startGame = () => {
    setLevel(1);
    setLives(3);
    setGameStatus('playing');
    setCorrectTiles([]);
    setErrorTile(null);
    setUserSequence([]);
    const initialSequence = generateSequence(1);
    setSequence(initialSequence);
    showSequence(initialSequence);
  };

  const showSequence = (sequenceToShow: number[]) => {
    setIsShowingSequence(true);
    setUserSequence([]);
    setCorrectTiles([]);
    setErrorTile(null);
    
    let currentIndex = 0;
    
    const showNext = () => {
      if (currentIndex >= sequenceToShow.length) {
        setActiveIndex(null);
        setIsShowingSequence(false);
        return;
      }
      
      setActiveIndex(sequenceToShow[currentIndex]);
      
      setTimeout(() => {
        setActiveIndex(null);
        setTimeout(() => {
          currentIndex++;
          showNext();
        }, 200); // Pause entre chaque numéro
      }, 800); // Durée d'affichage de chaque numéro
    };
    
    setTimeout(() => showNext(), 500); // Délai initial
  };

  const handleTileClick = (index: number) => {
    if (isShowingSequence || gameStatus !== 'playing') return;

    // Effet visuel immédiat au clic
    setClickedTile(index);
    setTimeout(() => setClickedTile(null), 200);

    const currentIndex = userSequence.length;
    
    if (index === sequence[currentIndex]) {
      // Bonne tuile - effet temporaire
      setCorrectTiles(prev => [...prev, index]);
      setTimeout(() => setCorrectTiles([]), 200);
      
      setUserSequence(prev => [...prev, index]);

      if (userSequence.length + 1 === sequence.length) {
        setTimeout(() => {
          setLevel(prev => prev + 1);
          const newSequence = generateSequence(level + 1);
          setSequence(newSequence);
          setUserSequence([]);
          showSequence(newSequence);
        }, 500);
      }
    } else {
      // Mauvaise tuile
      setErrorTile(index);
      setTimeout(() => setErrorTile(null), 200);
      setLives(prev => prev - 1);
      
      setTimeout(() => {
        if (lives <= 1) {
          setGameStatus('gameover');
          saveResult(level - 1);
        } else {
          setUserSequence([]);
          showSequence(sequence); // Rejouer la même séquence au même niveau
        }
      }, 500);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/sequenceMemory');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Failed to fetch results:', error);
    }
  };

  const saveResult = async (score: number) => {
    try {
      await fetch('/api/sequenceMemory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score }),
      });
      fetchResults();
    } catch (error) {
      console.error('Failed to save result:', error);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

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
            <h1 className="text-3xl font-bold mb-4">Test de Mémoire de Séquence</h1>
            <p className="mb-8">
              Mémorisez la séquence qui s'affiche et reproduisez-la dans le même ordre.
              À chaque niveau, la séquence s'allonge d'un clic.
              Vous avez trois vies.
            </p>
            <button 
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              onClick={startGame}
            >
              Commencer
            </button>
          </div>
        ) : (
          <>
            <div className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-sm shadow-lg z-40">
              <div className="max-w-screen-xl mx-auto h-full flex items-center justify-center gap-8">
                <div className="text-2xl">Niveau {level}</div>
                <div className="flex gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} className="text-2xl">
                      {i < (3 - lives) ? '🖤' : '❤️'}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-24">
              {Array.from({ length: 9 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleTileClick(index)}
                  disabled={isShowingSequence}
                  className={`
                    w-24 h-24 rounded-xl transition-all duration-200
                    ${isShowingSequence && activeIndex === index ? 'bg-blue-500' : ''}
                    ${correctTiles.includes(index) ? 'bg-green-500' : ''}
                    ${errorTile === index ? 'bg-red-500' : ''}
                    ${clickedTile === index ? 'scale-95 opacity-70' : ''}
                    ${!activeIndex && !correctTiles.includes(index) && errorTile !== index && clickedTile !== index ? 'bg-gray-200 hover:bg-gray-300' : ''}
                    disabled:cursor-not-allowed
                  `}
                />
              ))}
            </div>
          </>
        )}

        {gameStatus === 'gameover' && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-4">Partie terminée !</h2>
              <p className="text-xl mb-6">Niveau atteint : {level - 1}</p>
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