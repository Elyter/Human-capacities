'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function NumberMemoryTest() {
    const [level, setLevel] = useState(1);
    const [numbers, setNumbers] = useState<string>('');
    const [isShowingNumbers, setIsShowingNumbers] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'won' | 'lost'>('waiting');
    const inputRef = useRef<HTMLInputElement>(null);
    const [results, setResults] = useState<Array<{ timestamp: number, score: number }>>([]);

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const response = await fetch('/api/numberMemory');
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Erreur lors du chargement des résultats:', error);
        }
    };

    const saveResult = async (score: number) => {
        try {
            await fetch('/api/numberMemory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score })
            });
            await fetchResults();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du résultat:', error);
        }
    };

    const prepareChartData = () => {
        const intervals = Array.from({ length: 10 }, (_, i) => i + 1);
        const data = new Array(intervals.length).fill(0);
        
        results.forEach(result => {
            const index = Math.min(Math.floor(result.score) - 1, intervals.length - 1);
            if (index >= 0) data[index]++;
        });

        const totalResults = results.length;
        const percentages = data.map(count => (count / totalResults) * 100);

        return {
            labels: intervals.map(i => `${i} chiffres`),
            datasets: [{
                label: 'Pourcentage des scores',
                data: percentages,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Pourcentage des parties'
                }
            }
        },
        plugins: {
            title: {
                display: true,
                text: 'Distribution des scores'
            }
        }
    };

    const generateNumbers = (level: number) => {
        let result = '';
        // Génère autant de chiffres que le niveau actuel
        for (let i = 0; i < level; i++) {
            result += Math.floor(Math.random() * 10);
        }
        return result;
    };

    const startNewLevel = (newLevel?: number) => {
        const currentLevel = newLevel || level;
        const newNumbers = generateNumbers(currentLevel);
        console.log('Generating numbers for level:', currentLevel, 'Numbers:', newNumbers);
        setNumbers(newNumbers);
        setIsShowingNumbers(true);
        setUserInput('');

        setTimeout(() => {
            setIsShowingNumbers(false);
            // Focus sur l'input quand il apparaît
            setTimeout(() => inputRef.current?.focus(), 0);
        }, 5000);
    };

    const startGame = () => {
        setGameStatus('playing');
        setLevel(1);
        startNewLevel(1);
        console.log('Game started', level);
    };

    const checkAnswer = async () => {
        if (userInput === numbers) {
            const nextLevel = level + 1;
            setLevel(nextLevel);
            startNewLevel(nextLevel);
        } else {
            setGameStatus('lost');
            await saveResult(level - 1);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
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
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                    />
                </svg>
            </Link>
            
            {gameStatus === 'waiting' ? (
                <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
                    <h1 className="text-2xl font-bold">Test de Mémoire des Chiffres</h1>
                    <p className="text-center max-w-md mb-4">
                        Mémorisez les chiffres qui apparaissent pendant 5 secondes. 
                        À chaque niveau, vous devrez mémoriser un chiffre supplémentaire.
                    </p>
                    <button 
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={startGame}
                    >
                        Commencer le test
                    </button>
                    
                    {results.length > 0 && (
                        <div className="w-full max-w-2xl h-[400px] mt-8">
                            <Line data={prepareChartData()} options={chartOptions} />
                        </div>
                    )}
                </div>
            ) : gameStatus === 'lost' ? (
                <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                    <h1 className="text-2xl font-bold">Game Over!</h1>
                    <p>Vous avez atteint le niveau {level}</p>
                    <div className="flex flex-col items-center gap-2 my-4">
                        <p className="text-gray-600">Le chiffre à retenir était :</p>
                        <span className="text-2xl font-bold text-green-600">{numbers}</span>
                        <p className="text-gray-600">Vous avez écrit :</p>
                        <span className="text-2xl font-bold text-red-600 line-through">{userInput}</span>
                    </div>
                    <button 
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => {
                            setGameStatus('waiting');
                        }}
                    >
                        Recommencer
                    </button>
                </div>
            ) : gameStatus === 'playing' ? (
                <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                    <h1 className="text-2xl font-bold">Test de Mémoire des Chiffres</h1>
                    <p>Niveau {level}</p>
                    
                    {isShowingNumbers && (
                        <div className="w-64 h-2 bg-gray-200 rounded overflow-hidden">
                            <div className="progress-bar" key={level} />
                        </div>
                    )}
                    
                    {isShowingNumbers ? (
                        <div className="text-4xl font-bold">{numbers}</div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <input
                                ref={inputRef}
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="p-2 border border-gray-300 rounded"
                                autoFocus
                            />
                            <button 
                                onClick={checkAnswer}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Valider
                            </button>
                        </div>
                    )}
                </div>
            ) : null}
        </>
    );
}
