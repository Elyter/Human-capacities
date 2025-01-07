'use client'
import { useState, useEffect, useRef } from 'react'
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

type WordStatus = {
  text: string;
  status: 'waiting' | 'current' | 'correct' | 'incorrect';
};

const WORD_LIST = [
  "le", "la", "être", "avoir", "faire", "dire", "pouvoir", "aller", "voir", "vouloir",
  "venir", "devoir", "prendre", "trouver", "donner", "falloir", "parler", "mettre",
  "savoir", "passer", "regarder", "aimer", "croire", "demander", "rester", "répondre",
  "vivre", "partir", "suivre", "comprendre", "entendre", "attendre", "sortir", "connaître",
  "penser", "montrer", "sembler", "tenir", "porter", "chercher", "écrire", "marcher",
  "rappeler", "servir", "paraître", "décider", "arriver", "devenir", "laisser", "jouer",
  "reprendre", "permettre", "continuer", "compter", "entrer", "appeler", "garder", "ouvrir",
  "perdre", "commencer", "finir", "rendre", "tomber", "oublier", "recevoir", "revenir",
  "manger", "boire", "dormir", "courir", "lire", "chanter", "danser", "dessiner",
  "étudier", "apprendre", "enseigner", "travailler", "choisir", "accepter", "refuser",
  "acheter", "vendre", "payer", "construire", "détruire", "casser", "réparer", "nettoyer",
  "ranger", "organiser", "planifier", "voyager", "visiter", "explorer", "découvrir",
  "créer", "imaginer", "rêver", "espérer", "sourire", "pleurer", "rire", "grandir",
  "changer", "améliorer", "développer", "protéger", "défendre", "combattre", "gagner",
  "perdre", "essayer", "réussir", "échouer", "recommencer", "terminer", "abandonner",
  "célébrer", "féliciter", "remercier", "excuser", "pardonner", "aider", "soutenir",
  "conseiller", "guider", "diriger", "commander", "obéir", "respecter", "admirer",
  "détester", "préférer", "adorer", "apprécier", "supporter", "tolérer", "accepter",
  "refuser", "négocier", "discuter", "débattre", "argumenter", "convaincre", "douter",
  "croire", "penser", "réfléchir", "méditer", "observer", "examiner", "analyser"
]

const WORDS_PER_LINE = 8; // Nombre de mots par ligne

type Result = {
  timestamp: number;
  score: number;
}

export default function TypingSpeed() {
  const [isStarted, setIsStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [currentInput, setCurrentInput] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [shuffledWords, setShuffledWords] = useState<string[]>([])
  const [words, setWords] = useState<WordStatus[]>([])
  const [currentLine, setCurrentLine] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null);
  const [results, setResults] = useState<Result[]>([])

  // Séparer les effets pour le timer et la fin du jeu
  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isStarted, timeLeft])

  // Nouvel effet pour gérer la fin du jeu
  useEffect(() => {
    if (timeLeft === 0) {
      setIsFinished(true)
      setIsStarted(false)
      saveResult(wordCount)
    }
  }, [timeLeft])

  useEffect(() => {
    if (isStarted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isStarted]);

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/typingSpeed')
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Failed to fetch results:', error)
    }
  }

  const saveResult = async (score: number) => {
    try {
      await fetch('/api/typingSpeed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: Date.now(),
          score: score
        })
      })
      await fetchResults()
    } catch (error) {
      console.error('Failed to save result:', error)
    }
  }

  const shuffleWords = () => {
    return WORD_LIST.sort(() => Math.random() - 0.5).map(word => ({
      text: word,
      status: 'waiting'
    }))
  }

  const handleStart = () => {
    const shuffled = shuffleWords()
    shuffled[0].status = 'current'
    setWords(shuffled)
    setIsStarted(true)
    setWordCount(0)
    setTimeLeft(60)
    setIsFinished(false)
    setCurrentInput('')
    setCurrentWordIndex(0)
    setShuffledWords(shuffleWords())
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const getVisibleLines = () => {
    const allLines = [];
    for (let i = 0; i < words.length; i += WORDS_PER_LINE) {
      allLines.push(words.slice(i, i + WORDS_PER_LINE));
    }
    const startLine = currentLine;
    return allLines.slice(startLine, startLine + 5);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.endsWith(' ')) {
      const typedWord = value.trim()
      const newWords = [...words]
      const isCorrect = typedWord === words[currentWordIndex].text

      // Mettre à jour le statut du mot actuel
      newWords[currentWordIndex].status = isCorrect ? 'correct' : 'incorrect'

      // Mettre à jour le prochain mot
      if (currentWordIndex + 1 < newWords.length) {
        newWords[currentWordIndex + 1].status = 'current'
      }

      // Calculer si on doit passer à la ligne suivante
      if ((currentWordIndex + 1) % WORDS_PER_LINE === 0) {
        setCurrentLine(Math.floor((currentWordIndex + 1) / WORDS_PER_LINE));
      }

      setWords(newWords)
      if (isCorrect) {
        setWordCount((prev) => prev + 1)
      }
      setCurrentWordIndex((prev) => prev + 1)
      setCurrentInput('')
    } else {
      setCurrentInput(value)
    }
  }

  const prepareChartData = () => {
    const intervals = [0, 20, 40, 60, 80, 100]
    const counts = new Array(intervals.length - 1).fill(0)
    const total = results.length

    results.forEach(result => {
      for (let i = 0; i < intervals.length - 1; i++) {
        if (result.score >= intervals[i] && result.score < intervals[i + 1]) {
          counts[i]++
          break
        }
      }
    })

    const data = {
      labels: intervals.slice(0, -1).map(i => `${i}-${i + 20} mpm`),
      datasets: [{
        label: 'Distribution des scores',
        data: counts.map(count => (count / total) * 100 || 0),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    }

    return data
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribution des scores de vitesse de frappe'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Pourcentage'
        }
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-8">Test de Vitesse de Frappe</h1>
      
      {!isStarted && !isFinished && (
        <button 
          onClick={handleStart}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Démarrer le test
        </button>
      )}

      {isStarted && (
        <div className="w-full max-w-3xl">
          <div className="text-xl mb-4">Temps restant: {timeLeft} secondes</div>
          <div 
            ref={containerRef}
            className="text-lg mb-4 bg-white p-4 rounded shadow-md h-[200px] overflow-hidden"
          >
            <div className="flex flex-col gap-2">
              {getVisibleLines().map((line, lineIndex) => (
                <div key={lineIndex} className="flex flex-wrap gap-2">
                  {line.map((word, wordIndex) => (
                    <span
                      key={wordIndex}
                      className={`inline-block px-2 py-1 rounded ${
                        word.status === 'current' ? 'bg-blue-200 text-blue-800' :
                        word.status === 'correct' ? 'bg-green-200 text-green-800' :
                        word.status === 'incorrect' ? 'bg-red-200 text-red-800' :
                        'text-gray-700'
                      }`}
                    >
                      {word.text}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={handleInput}
            className="w-full p-2 border-2 border-gray-300 rounded"
            placeholder="Tapez les mots ici..."
            disabled={!isStarted}
          />
          <div className="mt-4">Mots corrects: {wordCount}</div>
        </div>
      )}

      {isFinished && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Test terminé!</h2>
          <p className="text-xl">Votre vitesse: {wordCount} mots par minute</p>
          <button 
            onClick={handleStart}
            className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Recommencer
          </button>
        </div>
      )}

      <div className="w-full max-w-3xl mt-8">
        <div className="bg-white p-4 rounded shadow-md">
          <Line data={prepareChartData()} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}
