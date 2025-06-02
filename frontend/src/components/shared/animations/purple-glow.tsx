import React from 'react';
import { motion } from 'framer-motion';

interface PurpleGlowProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  animate?: boolean;
}

export function PurpleGlow({ 
  children, 
  className = "", 
  intensity = 'medium',
  animate = true 
}: PurpleGlowProps) {
  const glowIntensity = {
    low: '0 0 10px rgba(139, 92, 246, 0.3)',
    medium: '0 0 20px rgba(139, 92, 246, 0.5)',
    high: '0 0 30px rgba(139, 92, 246, 0.7)'
  };

  const animationProps = animate ? {
    animate: {
      boxShadow: [
        glowIntensity[intensity],
        `0 0 ${intensity === 'high' ? '40px' : intensity === 'medium' ? '30px' : '15px'} rgba(139, 92, 246, 0.8)`,
        glowIntensity[intensity]
      ]
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {
    style: { boxShadow: glowIntensity[intensity] }
  };

  return (
    <motion.div
      className={className}
      {...animationProps}
    >
      {children}
    </motion.div>
  );
}
