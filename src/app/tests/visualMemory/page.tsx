'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'
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
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [sequence, setSequence] = useState<number[]>([])
  const [userSequence, setUserSequence] = useState<number[]>([])
  const [isShowingSequence, setIsShowingSequence] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [correctTiles, setCorrectTiles] = useState<number[]>([])
  const [errorTiles, setErrorTiles] = useState<number[]>([])
  const [isStarted, setIsStarted] = useState(false)
  const [results, setResults] = useState<Array<{ timestamp: number; score: number }>>([])

  const gridSize = Math.min(3 + Math.floor(level / 2), 7)
  const tilesToRemember = Math.min(3 + level, gridSize * gridSize - 1)

  const generateSequence = () => {
    const newSequence = []
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
    setMistakes(0)
    
    // Délai avant d'afficher la nouvelle séquence pour effacer les tuiles
    setTimeout(() => {
      const newSequence = generateSequence()
      setSequence(newSequence)
      setIsShowingSequence(true)
      setTimeout(() => setIsShowingSequence(false), 3000)
    }, 1000)
  }

  const startGame = () => {
    setIsStarted(true)
    startLevel()
  }

  const handleTileClick = (index: number) => {
    if (isShowingSequence || gameOver) return

    if (!sequence.includes(index)) {
      const newMistakes = mistakes + 1
      setMistakes(newMistakes)
      setErrorTiles(prev => [...prev, index])
      
      if (newMistakes >= 3) {
        setLives(prev => prev - 1)
        if (lives <= 1) {
          setGameOver(true)
          saveResult(score) // Sauvegarder le score final
        } else {
          startLevel() // Démarrage immédiat du nouveau niveau
        }
      }
    } else if (!userSequence.includes(index)) {
      const newUserSequence = [...userSequence, index]
      setUserSequence(newUserSequence)
      setCorrectTiles(prev => [...prev, index])
      
      if (newUserSequence.length === sequence.length) {
        setScore(prev => prev + level)
        setLevel(prev => prev + 1)
        startLevel() // Le niveau suivant commencera avec un délai grâce au setTimeout dans startLevel
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
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 19l-7-7m0 0l7-7m-7 7h18" 
          />
        </svg>
      </Link>

      <div className={styles.container}>
        {!isStarted ? (
          <>
            <div className={styles.startScreen}>
              <h2>Test de Mémoire Visuelle</h2>
              <p>Mémorisez les tuiles qui s&apos;affichent et reproduisez la séquence.</p>
              <p>Vous avez droit à 3 erreurs par niveau avant de perdre une vie.</p>
              <button onClick={startGame}>Commencer le test</button>
            </div>
            <div className={styles.chartContainer} style={{ height: '300px', marginTop: '2rem' }}>
              <Line data={prepareChartData()} options={chartOptions} />
            </div>
          </>
        ) : (
          <>
            <div className={styles.stats}>
              <div>Vies : {Array(lives).fill('❤️').join(' ')}</div>
              <div>Niveau : {level}</div>
              <div>Score : {score}</div>
            </div>

            <div 
              className={styles.grid}
              style={{ 
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                pointerEvents: isShowingSequence ? 'none' : 'auto'
              }}
            >
              {Array.from({ length: gridSize * gridSize }).map((_, index) => (
                <div
                  key={index}
                  className={`${styles.tile} ${
                    isShowingSequence && sequence.includes(index) ? styles.active : ''
                  } ${correctTiles.includes(index) ? styles.correct : ''} ${
                    errorTiles.includes(index) ? styles.error : ''
                  }`}
                  onClick={() => handleTileClick(index)}
                />
              ))}
            </div>

            {gameOver && (
              <div className={styles.gameOver}>
                <h2>Partie Terminée !</h2>
                <p>Score final : {score}</p>
                <p>Niveau atteint : {level}</p>
                <button onClick={() => window.location.reload()}>Rejouer</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
