'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import StartModal from '@/components/StartModal'
import ProgressBar from "@/components/ProgressBar";
import GameOverModal from '@/components/GameOverModal';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function VisualMemoryTest() {
  const [lives, setLives] = useState(2)
  const [level, setLevel] = useState(1)
  const [sequence, setSequence] = useState<number[]>([])
  const [userSequence, setUserSequence] = useState<number[]>([])
  const [isShowingSequence, setIsShowingSequence] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [correctTiles, setCorrectTiles] = useState<number[]>([])
  const [errorTiles, setErrorTiles] = useState<number[]>([])
  const [isStarted, setIsStarted] = useState(false)
  const [results, setResults] = useState<Array<{ timestamp: number; score: number }>>([])
  const [isProcessingError, setIsProcessingError] = useState(false)

  const gridSize = Math.min(3 + Math.floor(level / 2), 7)
  const tilesToRemember = Math.min(3 + level, gridSize * gridSize - 1)
  const SEQUENCE_SHOW_TIME = 2200 // 2,2 secondes

  const generateSequence = () => {
    const newSequence: number[] = []
    while (newSequence.length < tilesToRemember) {
      const num = Math.floor(Math.random() * (gridSize * gridSize))
      if (!newSequence.includes(num)) newSequence.push(num)
    }
    return newSequence
  }

  const startLevel = () => {
    setCorrectTiles([])
    setErrorTiles([])
    setUserSequence([])
    
    const newSequence = generateSequence()
    setSequence(newSequence)
    setIsShowingSequence(true)
    
    // La séquence se termine après SEQUENCE_SHOW_TIME
    setTimeout(() => {
      setIsShowingSequence(false)
      setIsProcessingError(false) // Réactive les clics uniquement après la séquence
    }, SEQUENCE_SHOW_TIME)
  }

  const startGame = () => {
    setIsStarted(true)
    startLevel()
  }

  const handleTileClick = (index: number) => {
    if (isShowingSequence || gameOver || isProcessingError) return

    if (!sequence.includes(index)) {
      // Mauvaise tuile : perd une vie immédiatement
      setIsProcessingError(true)
      const newLives = lives - 1
      setLives(newLives)
      setErrorTiles(prev => [...prev, index])
      
      if (newLives <= 0) {
        setGameOver(true)
        saveResult(level)
      } else {
        // Attend 500ms avec la tuile rouge visible
        setTimeout(() => {
          // Démarre directement la nouvelle séquence
          startLevel()
        }, 500)
      }
    } else if (!userSequence.includes(index)) {
      // Bonne tuile
      const newUserSequence = [...userSequence, index]
      setUserSequence(newUserSequence)
      setCorrectTiles(prev => [...prev, index])
      
      if (newUserSequence.length === sequence.length) {
        // Niveau réussi
        setLevel(prev => prev + 1)
        startLevel()
      }
    }
  }

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/visualMemory')
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Failed to fetch results:', error)
    }
  }

  const saveResult = async (finalScore: number) => {
    try {
      await fetch('/api/visualMemory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: finalScore })
      })
      await fetchResults()
    } catch (error) {
      console.error('Failed to save result:', error)
    }
  }

  const prepareChartData = () => {
    const intervals = Array.from({ length: 11 }, (_, i) => i * 10)
    const data = new Array(intervals.length - 1).fill(0)
    
    results.forEach(result => {
      const index = Math.min(Math.floor(result.score / 10), intervals.length - 2)
      data[index]++
    })

    const total = data.reduce((a, b) => a + b, 0)
    const percentages = data.map(count => (count / total) * 100)

    return {
      labels: intervals.slice(0, -1).map(i => `${i}-${i + 9}`),
      datasets: [{
        label: 'Distribution des scores (%)',
        data: percentages,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '% des parties'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Intervalles de score'
        }
      }
    }
  }

  useEffect(() => {
    fetchResults()
  }, [])

  const calculateGridSize = () => {
    if (typeof window === 'undefined') return 400; // Valeur par défaut pour SSR
    
    const maxSize = Math.min(
      window.innerWidth * 0.8,
      (window.innerHeight - 250) * 0.9
    );
    return Math.floor(Math.min(maxSize, 500) / gridSize) * gridSize;
  };

  const [tileSize, setTileSize] = useState(400); // Valeur par défaut fixe

  useEffect(() => {
    setTileSize(calculateGridSize()); // Met à jour la taille une fois monté
    
    const handleResize = () => {
      setTileSize(calculateGridSize());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gridSize]);

  const handleRestart = () => {
    setGameOver(false);
    setLevel(1);
    setLives(2);
    setSequence([]);
    setUserSequence([]);
    setCorrectTiles([]);
    setErrorTiles([]);
    startLevel();
  };

  const handleBackToRules = () => {
    setIsStarted(false);
    setGameOver(false);
    setLevel(1);
    setLives(2);
    setSequence([]);
    setUserSequence([]);
    setCorrectTiles([]);
    setErrorTiles([]);
  };

  return (
    <>
      <Link 
        href="/"
        className="fixed top-4 left-4 w-12 h-12 bg-white dark:bg-gray-800 dark:text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-50"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 19l-7-7m0 0l7-7m-7 7h18" 
          />
        </svg>
      </Link>

      <div className="h-full min-h-[100vh] bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-screen-xl mx-auto">
          {!isStarted ? (
            <StartModal 
              title="Test de Mémoire Visuelle"
              description={
                <p>
                  Testez votre mémoire visuelle.
                  Des tuiles vont s'illuminer brièvement à l'écran.
                  Reproduisez la séquence pour passer au niveau suivant.
                  Vous avez droit à 2 erreurs.
                </p>
              }
              onStart={startGame}
              stats={results.length > 0 ? (
                <Line data={prepareChartData()} options={chartOptions} />
              ) : (
                <p className="text-center dark:text-gray-200">Aucune donnée disponible pour le moment.</p>
              )}
            />
          ) : (
            <>
              <div className="fixed top-0 left-0 right-0 h-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg z-40">
                <div className="max-w-screen-xl mx-auto h-full flex items-center justify-center gap-8">
                  <div className="text-2xl dark:text-white">Niveau {level}</div>
                  <div className="flex gap-1">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <span key={i} className="text-2xl">
                        {i < (2 - lives) ? '🖤' : '❤️'}
                      </span>
                    ))}
                  </div>
                </div>
                {isShowingSequence && (
                  <ProgressBar 
                    duration={SEQUENCE_SHOW_TIME} 
                    isActive={isShowingSequence} 
                  />
                )}
              </div>

              <div 
                className="grid mx-auto mt-32" 
                style={{ 
                  display: 'grid',
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                  gap: '0.5rem',
                  width: `${tileSize}px`,
                  height: `${tileSize}px`,
                  pointerEvents: isShowingSequence || isProcessingError ? 'none' : 'auto',
                }}
              >
                {Array.from({ length: gridSize * gridSize }).map((_, index) => (
                  <div
                    key={index}
                    onClick={() => handleTileClick(index)}
                    style={{
                      width: `${tileSize / gridSize - 8}px`, // Soustrait l'espace du gap
                      height: `${tileSize / gridSize - 8}px`
                    }}
                    className={`
                      rounded-xl transition-colors cursor-pointer backdrop-blur-sm shadow-lg
                      ${isShowingSequence && sequence.includes(index) 
                        ? 'bg-blue-500' 
                        : correctTiles.includes(index)
                          ? 'bg-green-500'
                          : errorTiles.includes(index)
                            ? 'bg-red-500'
                            : 'bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <GameOverModal 
        isOpen={gameOver}
        score={level}
        onRestart={handleRestart}
        onBackToRules={handleBackToRules}
        scoreLabel="Niveau atteint"
      />
    </>
  )
}
