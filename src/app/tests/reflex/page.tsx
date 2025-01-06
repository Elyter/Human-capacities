'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function ReflexTest() {
  const [backgroundColor, setBackgroundColor] = useState<string>('white');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [showStart, setShowStart] = useState<boolean>(true);
  const [tooEarly, setTooEarly] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  const resetTest = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setCurrentTime(0);
    setBackgroundColor('white');
    setStartTime(null);
    setReactionTime(null);
    setIsWaiting(false);
    setShowStart(true);
    setTooEarly(false);
  };

  const updateTimer = () => {
    const now = performance.now();
    setCurrentTime(Math.round(now - startTimeRef.current));
    animationFrameRef.current = requestAnimationFrame(updateTimer);
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
      startTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(updateTimer);
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

    if (backgroundColor === 'green') {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setReactionTime(currentTime);
      setBackgroundColor('white');
      setIsWaiting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

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
      <div
        className="flex flex-col items-center justify-center min-h-screen cursor-pointer"
        style={{ backgroundColor }}
        onMouseDown={handleClick}
      >
        {showStart ? (
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded-lg text-xl hover:bg-blue-600 transition-colors"
            onMouseDown={(e) => {
              e.stopPropagation();
              startTest();
            }}
          >
            Démarrer
          </button>
        ) : (
          <div className="text-center">
            {backgroundColor === 'green' && (
              <>
                <div className="text-white text-6xl font-bold mb-4">
                  CLIC !
                </div>
                <div className="text-white text-3xl">
                  {currentTime} ms
                </div>
              </>
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
    </>
  );
}
