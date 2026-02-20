import { useState, useEffect } from 'react';

interface GreyscaleOverlayProps {
  intensity: number;
}

export function GreyscaleOverlay({ intensity }: GreyscaleOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const grayscaleAmount = Math.min((intensity - 2) * 30, 50);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-40 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        backdropFilter: `grayscale(${grayscaleAmount}%)`,
        WebkitBackdropFilter: `grayscale(${grayscaleAmount}%)`,
      }}
    />
  );
}
