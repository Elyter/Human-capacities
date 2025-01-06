'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ChimpTest() {
  const [level, setLevel] = useState(4); // Commence à 4 chiffres
  const [numbers, setNumbers] = useState<{position: number, value: number}[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'showing' | 'gameover'>('waiting');
  const [strikes, setStrikes] = useState(0);
  const [score, setScore] = useState(0);
  const [gridSize, setGridSize] = useState(4); // Commence avec une grille 4x4
  const [numbersVisible, setNumbersVisible] = useState(true);
  const [correctTiles, setCorrectTiles] = useState<number[]>([]);
  const [errorTile, setErrorTile] = useState<number | null>(null);
  const [clickedTile, setClickedTile] = useState<number | null>(null);

  // Ajuster la taille de la grille en fonction du niveau
  useEffect(() => {
    const levelIndex = level - 4; // Niveau 4 = index 0
    const shouldIncreaseGrid = levelIndex > 0 && levelIndex % 3 === 0;
    if (shouldIncreaseGrid) {
      setGridSize(prev => Math.min(prev + 1, 8)); // Maximum 8x8
    }
  }, [level]);

  const generateSequence = () => {
    const positions = new Set<number>();
    const sequence: {position: number, value: number}[] = [];
    
    // Utiliser le niveau actuel comme nombre de chiffres à générer
    while (positions.size < level) {
      const pos = Math.floor(Math.random() * (gridSize * gridSize));
      if (!positions.has(pos)) {
        positions.add(pos);
        sequence.push({
          position: pos,
          value: positions.size
        });
      }
    }
    
    return sequence;
  };

  const startGame = () => {
    setLevel(4); // Commence avec 4 chiffres
    setGridSize(4); // Réinitialise à une grille 4x4
    setStrikes(0);
    setScore(0);
    setGameStatus('playing');
    startNewLevel();
  };

  const startNewLevel = () => {
    const newSequence = generateSequence();
    setNumbers(newSequence);
    setUserSequence([]);
    setGameStatus('playing');
    setNumbersVisible(true);
    setCorrectTiles([]);
    setErrorTile(null);
  };

  const handleTileClick = (position: number) => {
    if (gameStatus !== 'playing') return;

    setClickedTile(position);
    setTimeout(() => setClickedTile(null), 200);

    const clickedNumber = numbers.find(n => n.position === position);
    if (!clickedNumber) return;

    if (clickedNumber.value === 1) {
      setNumbersVisible(false);
    }

    const expectedValue = userSequence.length + 1;
    
    if (clickedNumber.value === expectedValue) {
      setCorrectTiles(prev => [...prev, position]);
      const newSequence = [...userSequence, clickedNumber.value];
      setUserSequence(newSequence);

      if (newSequence.length === numbers.length) {
        // Niveau réussi
        setScore(prev => prev + level); // Score basé sur le nombre de chiffres
        setLevel(prev => prev + 1); // Augmente le nombre de chiffres
        setTimeout(() => {
          startNewLevel();
          setNumbersVisible(true);
          setCorrectTiles([]);
        }, 500);
      }
    } else {
      // Erreur
      setErrorTile(position);
      setStrikes(prev => prev + 1);
      if (strikes >= 2) {
        setGameStatus('gameover');
      } else {
        setTimeout(() => {
          startNewLevel();
          setNumbersVisible(true);
          setCorrectTiles([]);
          setErrorTile(null);
        }, 500);
      }
    }
  };

  useEffect(() => {
    if (gameStatus === 'showing') {
      setTimeout(() => {
        setGameStatus('playing');
      }, 3000);
    }
  }, [gameStatus]);

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
            <h1 className="text-3xl font-bold mb-4">Test du Chimpanzé</h1>
            <p className="mb-4">
              Les chimpanzés surpassent systématiquement les humains dans ce test de mémoire.
              Certains peuvent mémoriser 9 chiffres avec plus de 90% de réussite.
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
                <div className="text-2xl font-medium">Niveau {level - 3}</div>
                <div className="flex gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} className="text-2xl">
                      {i < strikes ? '🖤' : '❤️'}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center min-h-screen">
              <div 
                className="grid gap-2 mx-auto"
                style={{ 
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                  width: `${gridSize * 80}px`,
                  height: `${gridSize * 80}px`
                }}
              >
                {Array.from({ length: gridSize * gridSize }).map((_, index) => {
                  const number = numbers.find(n => n.position === index);
                  const isCorrect = correctTiles.includes(index);
                  const isError = errorTile === index;
                  const isClicked = clickedTile === index;

                  return (
                    <button
                      key={index}
                      onClick={() => handleTileClick(index)}
                      className={`
                        w-16 h-16 rounded-lg transition-all transform duration-200
                        ${number ? 'bg-blue-500 hover:bg-blue-600 shadow-lg' : 'bg-transparent'}
                        ${gameStatus === 'playing' ? 'cursor-pointer hover:scale-105' : ''}
                        ${isCorrect ? 'bg-green-500 hover:bg-green-600 animate-[pulse_0.5s_ease-in-out]' : ''}
                        ${isError ? 'bg-red-500 hover:bg-red-600 animate-[bounce_0.5s_ease-in-out]' : ''}
                        ${isClicked ? 'scale-95' : ''}
                        relative overflow-hidden flex items-center justify-center
                      `}
                    >
                      {numbersVisible && number && (
                        <span className="text-white text-2xl font-bold">
                          {number.value}
                        </span>
                      )}
                      {isCorrect && (
                        <div className="absolute inset-0 bg-green-400 opacity-50 animate-[ping_0.75s_ease-in-out]" />
                      )}
                      {isError && (
                        <div className="absolute inset-0 bg-red-400 opacity-50 animate-[ping_0.75s_ease-in-out]" />
                      )}
                      {isClicked && !isCorrect && !isError && (
                        <div className="absolute inset-0 bg-white opacity-30 animate-[ping_0.4s_ease-in-out]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {gameStatus === 'gameover' && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-4">Partie terminée !</h2>
              <p className="text-xl mb-6">Niveau atteint : {level - 3}</p>
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