import React, { useState, useEffect } from 'react';

interface TypewriterTextareaProps {
  text: string;
  onChange: (value: string) => void;
  className?: string;
}

export const TypewriterTextarea: React.FC<TypewriterTextareaProps> = ({ text, onChange, className }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let currentIndex = 0;
    
    // Type out fast enough to feel responsive but slow enough to look like AI composing
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex += 2; // jump 2 chars for speed
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [text]);

  const handleManualChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIsTyping(false);
    setDisplayedText(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <textarea
        className={className}
        value={displayedText}
        onChange={handleManualChange}
      />
      {isTyping && (
        <span className="absolute bottom-3 right-3 pointer-events-none inline-flex items-center gap-1.5 text-[11px] font-mono text-green-400 bg-slate-900/95 px-2.5 py-1 rounded-md border border-green-500/40 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
          <span>AI Live Composing...</span>
        </span>
      )}
    </div>
  );
};
