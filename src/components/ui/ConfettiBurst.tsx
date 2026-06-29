import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#10b981', '#34d399', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

export const ConfettiBurst: React.FC = () => {
  const [pieces, setPieces] = useState<Array<{ id: number; x: number; y: number; color: string; rotate: number; scale: number }>>([]);

  useEffect(() => {
    const generated = Array.from({ length: 45 }).map((_, idx) => ({
      id: idx,
      x: (Math.random() - 0.5) * 600,
      y: -Math.random() * 400 - 100,
      color: COLORS[idx % COLORS.length],
      rotate: Math.random() * 720,
      scale: Math.random() * 0.8 + 0.4
    }));
    setPieces(generated);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50 flex items-center justify-center">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: p.scale, rotate: 0 }}
          animate={{ x: p.x, y: p.y + 500, opacity: 0, rotate: p.rotate }}
          transition={{ duration: 2.2, ease: "easeOut" }}
          style={{ backgroundColor: p.color }}
          className="absolute w-2.5 h-2.5 rounded-sm shadow-md"
        />
      ))}
    </div>
  );
};
