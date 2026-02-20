import { useState, useEffect } from 'react';

export function useBurnoutMonitor() {
  const [burnoutIndex, setBurnoutIndex] = useState(0);
  const [burnoutLevel, setBurnoutLevel] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBurnoutIndex((prev) => {
        const increase = Math.random() * 0.5;
        const newValue = Math.min(prev + increase, 10);
        return newValue;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (burnoutIndex >= 7) {
      setBurnoutLevel(2);
    } else if (burnoutIndex >= 4) {
      setBurnoutLevel(1);
    } else {
      setBurnoutLevel(0);
      setIsDismissed(false);
    }
  }, [burnoutIndex]);

  const dismissWarning = () => {
    setIsDismissed(true);
  };

  return {
    burnoutIndex,
    burnoutLevel: isDismissed ? 0 : burnoutLevel,
    dismissWarning,
  };
}
