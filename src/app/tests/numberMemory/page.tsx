'use client';
import { useState, useEffect, useRef } from 'react';

export default function NumberMemoryTest() {
    const [level, setLevel] = useState(1);
    const [numbers, setNumbers] = useState<string>('');
    const [isShowingNumbers, setIsShowingNumbers] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'won' | 'lost'>('waiting');
    const inputRef = useRef<HTMLInputElement>(null);

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

    const checkAnswer = () => {
        if (userInput === numbers) {
            const nextLevel = level + 1;
            setLevel(nextLevel);
            startNewLevel(nextLevel);
        } else {
            setGameStatus('lost');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    };

    if (gameStatus === 'waiting') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
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
            </div>
        );
    }

    if (gameStatus === 'lost') {
        return (
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
        );
    }

    if (gameStatus === 'playing') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <h1 className="text-2xl font-bold">Test de Mémoire des Chiffres</h1>
                <p>Niveau {level}</p>
                
                {/* Barre de progression modifiée */}
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
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-2xl font-bold">Test de Mémoire des Chiffres</h1>
            <p>Niveau {level}</p>
            
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
    );
}

// Ajouter ce style global dans votre CSS ou directement dans le composant
const styles = `
@keyframes progress {
    from {
        width: 100%;
    }
    to {
        width: 0%;
    }
}
`;
