'use client';

import { useEffect, useState, useRef } from 'react';

export default function ReflexTest() {
  const [backgroundColor, setBackgroundColor] = useState<string>('white');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [showStart, setShowStart] = useState<boolean>(true);
  const [tooEarly, setTooEarly] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTest = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setBackgroundColor('white');
    setStartTime(null);
    setReactionTime(null);
    setIsWaiting(false);
    setShowStart(true);
    setTooEarly(false);
  };

  const startTest = () => {
    setBackgroundColor('gray');
    setReactionTime(null);
    setIsWaiting(true);
    setShowStart(false);
    setTooEarly(false);
    
    const delay = Math.random() * 4000 + 1000;
    
    timeoutRef.current = setTimeout(() => {
      setBackgroundColor('green');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (showStart || tooEarly) {
      return;
    }

    if (!isWaiting) {
      resetTest();
      return;
    }

    if (backgroundColor === 'gray') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setTooEarly(true);
      setBackgroundColor('red');
      setTimeout(() => {
        resetTest();
      }, 2000);
      return;
    }

    if (backgroundColor === 'green' && startTime) {
      const endTime = Date.now();
      setReactionTime(endTime - startTime);
      setBackgroundColor('white');
      setIsWaiting(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen cursor-pointer"
      style={{ backgroundColor }}
      onClick={handleClick}
    >
      {showStart ? (
        <button
          className="px-6 py-3 bg-blue-500 text-white rounded-lg text-xl hover:bg-blue-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            startTest();
          }}
        >
          Démarrer
        </button>
      ) : (
        <div className="text-center">
          {backgroundColor === 'green' && (
            <div className="text-white text-6xl font-bold">
              CLIC !
            </div>
          )}
          {backgroundColor === 'gray' && !tooEarly && (
            <p className="text-white text-xl">Attendez le signal vert...</p>
          )}
          {tooEarly && (
            <div className="text-white text-4xl font-bold">
              Trop tôt !
            </div>
          )}
          {reactionTime && reactionTime > 0 && (
            <div className="bg-white p-4 rounded-lg">
              <p className="text-xl">Votre temps de réaction : {reactionTime} ms</p>
              <p className="mt-2">Cliquez n'importe où pour réessayer</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
