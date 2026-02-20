import { useState, useEffect } from 'react';

export function useBlockingLogic() {
  const [warningCount, setWarningCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(25 * 60);

  useEffect(() => {
    if (warningCount >= 2) {
      setIsBlocked(true);
    }
  }, [warningCount]);

  useEffect(() => {
    if (!isBlocked) return;

    const interval = setInterval(() => {
      setBlockTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsBlocked(false);
          setWarningCount(0);
          return 25 * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBlocked]);

  const completeProductiveSession = () => {
    setIsBlocked(false);
    setWarningCount(0);
    setBlockTimeRemaining(25 * 60);
  };

  return {
    isBlocked,
    blockTimeRemaining,
    completeProductiveSession,
  };
}
