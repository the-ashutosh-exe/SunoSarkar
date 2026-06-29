import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimeAgoProps {
  timestamp?: any;
  className?: string;
}

export const TimeAgo: React.FC<TimeAgoProps> = ({ timestamp, className = '' }) => {
  const [timeText, setTimeText] = useState<string>('Just now');

  useEffect(() => {
    const updateTime = () => {
      if (!timestamp) {
        setTimeText('2m ago'); // fallback demo time
        return;
      }

      let date: Date;
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else {
        setTimeText('3m ago');
        return;
      }

      const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
      if (isNaN(diffSeconds) || diffSeconds < 30) {
        setTimeText('Just now');
      } else if (diffSeconds < 60) {
        setTimeText(`${diffSeconds}s ago`);
      } else if (diffSeconds < 3600) {
        setTimeText(`${Math.floor(diffSeconds / 60)}m ago`);
      } else if (diffSeconds < 86400) {
        setTimeText(`${Math.floor(diffSeconds / 3600)}h ago`);
      } else {
        setTimeText(`${Math.floor(diffSeconds / 86400)}d ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <span className={`inline-flex items-center gap-1 font-mono text-[11px] text-slate-500 ${className}`}>
      <Clock className="w-3 h-3 text-slate-600 shrink-0" />
      <span>{timeText}</span>
    </span>
  );
};
