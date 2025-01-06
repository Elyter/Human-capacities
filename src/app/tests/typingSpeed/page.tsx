'use client'
import { useState, useEffect, useRef } from 'react'

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

  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)

      return () => clearInterval(timer)
    } else if (timeLeft === 0) {
      setIsFinished(true)
      setIsStarted(false)
    }
  }, [isStarted, timeLeft])

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
    </div>
  )
}
