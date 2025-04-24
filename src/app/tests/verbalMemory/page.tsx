'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import StartModal from '@/components/StartModal';
import ProgressBar from "@/components/ProgressBar";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
  const [results, setResults] = useState<Array<{ timestamp: number; score: number }>>([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/verbalMemory');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Erreur lors du chargement des résultats:', error);
    }
  };

  const saveScore = async () => {
    try {
      await fetch('/api/verbalMemory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score }),
      });
      fetchResults();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du score:', error);
    }
  };

  const prepareChartData = () => {
    const intervals = Array.from({ length: 10 }, (_, i) => i * 10);
    const data = new Array(intervals.length).fill(0);
    const total = results.length;

    results.forEach(result => {
      const index = Math.floor(result.score / 10);
      if (index < data.length) {
        data[index]++;
      }
    });

    const percentages = data.map(count => (count / total) * 100 || 0);

    return {
      labels: intervals.map(i => `${i}-${i + 9}`),
      datasets: [{
        label: 'Distribution des scores (%)',
        data: percentages,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
        fill: true,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Intervalles de score',
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Pourcentage des parties (%)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribution des scores',
      },
    },
  };

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

  const handleGameOver = async () => {
    setGameStatus('gameover');
    await saveScore();
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
        handleGameOver();
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
        className="fixed top-4 left-4 w-12 h-12 bg-white dark:bg-gray-800 dark:text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-50"
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

      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        {gameStatus === 'waiting' ? (
          <StartModal 
            title="Test de Mémoire Verbale"
            description={
              <p>
                Des mots vont apparaître un par un.
                Si vous avez déjà vu le mot, cliquez sur "VU".
                Si c'est la première fois que vous voyez le mot, cliquez sur "NOUVEAU".
                Vous avez trois vies.
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
                <div className="text-2xl dark:text-white">Score: {score}</div>
                <div className="flex gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} className="text-2xl">
                      {i < (3 - vies) ? '🖤' : '❤️'}
                    </span>
                  ))}
                </div>
              </div>
              {motCourant && (
                <ProgressBar 
                  duration={3000} 
                  isActive={gameStatus === 'playing'} 
               />
              )}
            </div>

            <div className="flex flex-col items-center justify-center gap-8 pt-24">
              <div className="text-4xl font-bold mb-8 dark:text-white">{motCourant}</div>
              
              <div className="flex gap-6">
                <button 
                  onClick={() => handleReponse(true)}
                  className="px-10 py-5 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl hover:from-indigo-700 hover:to-blue-800 transition-all duration-200 text-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform active:scale-95"
                >
                  DÉJÀ VU
                </button>
                <button 
                  onClick={() => handleReponse(false)}
                  className="px-10 py-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 text-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform active:scale-95"
                >
                  NOUVEAU
                </button>
              </div>
            </div>
          </>
        )}

        {gameStatus === 'gameover' && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-4 dark:text-white">Partie terminée !</h2>
              <p className="text-xl mb-6 dark:text-gray-200">Score final : {score}</p>
              <button 
                onClick={() => setGameStatus('waiting')}
                className="px-6 py-3 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-xl hover:from-indigo-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Retour aux règles
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}