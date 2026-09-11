import React, { useState, useEffect } from 'react';

export default function TypewriterText({ text = '', speed = 18, onComplete }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);

    if (!text) {
      setIsComplete(true);
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex += 1;
      setDisplayedText(text.slice(0, currentIndex));

      if (currentIndex >= text.length) {
        clearInterval(interval);
        setIsComplete(true);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  const handleSkip = () => {
    setDisplayedText(text);
    setIsComplete(true);
    if (onComplete) onComplete();
  };

  return (
    <span
      onClick={handleSkip}
      title={!isComplete ? 'Click to show all text' : ''}
      className={`cursor-pointer transition-colors ${!isComplete ? 'hover:text-tavern-glow' : ''}`}
    >
      {displayedText}
      {!isComplete && (
        <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-tavern-glow animate-pulse align-middle" />
      )}
    </span>
  );
}
