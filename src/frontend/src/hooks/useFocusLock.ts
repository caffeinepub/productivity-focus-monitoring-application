import { useState, useEffect, useCallback } from 'react';

interface FocusLockState {
  isLocked: boolean;
  lockDuration: number; // in seconds
  remainingTime: number; // in seconds
  activatedAt: number;
  reason: string;
}

const STORAGE_KEY = 'focus-guardian-lock';

// Calculate lock duration based on destructive visit count
function calculateLockDuration(visitCount: number): number {
  if (visitCount >= 13) {
    // 13+ visits: 45-60 minutes
    return 45 * 60 + Math.min((visitCount - 13) * 60, 15 * 60);
  } else if (visitCount >= 8) {
    // 8-12 visits: 15-30 minutes
    return 15 * 60 + ((visitCount - 8) * 3 * 60);
  } else if (visitCount >= 6) {
    // 6-7 visits: 5-10 minutes
    return 5 * 60 + ((visitCount - 6) * 2.5 * 60);
  }
  return 5 * 60; // Default 5 minutes
}

export function useFocusLock(destructiveVisitCount: number, warningLevel: number) {
  const [lockState, setLockState] = useState<FocusLockState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const elapsed = Math.floor((Date.now() - parsed.activatedAt) / 1000);
      const remaining = Math.max(0, parsed.lockDuration - elapsed);
      
      return {
        ...parsed,
        remainingTime: remaining,
        isLocked: remaining > 0,
      };
    }
    return {
      isLocked: false,
      lockDuration: 0,
      remainingTime: 0,
      activatedAt: 0,
      reason: '',
    };
  });

  // Activate lock when threshold is reached
  useEffect(() => {
    if (!lockState.isLocked && (destructiveVisitCount >= 6 || warningLevel >= 3)) {
      const duration = calculateLockDuration(destructiveVisitCount);
      const newState: FocusLockState = {
        isLocked: true,
        lockDuration: duration,
        remainingTime: duration,
        activatedAt: Date.now(),
        reason: `${destructiveVisitCount} distructive site visits detected`,
      };
      
      setLockState(newState);
    }
  }, [destructiveVisitCount, warningLevel, lockState.isLocked]);

  // Countdown timer
  useEffect(() => {
    if (!lockState.isLocked || lockState.remainingTime <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setLockState(prev => {
        const newRemaining = prev.remainingTime - 1;
        if (newRemaining <= 0) {
          localStorage.removeItem(STORAGE_KEY);
          return {
            ...prev,
            remainingTime: 0,
            isLocked: false,
          };
        }
        return {
          ...prev,
          remainingTime: newRemaining,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lockState.isLocked, lockState.remainingTime]);

  // Save lock state to localStorage
  useEffect(() => {
    if (lockState.isLocked) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lockState));
    }
  }, [lockState]);

  // Format time for display
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    isLocked: lockState.isLocked,
    lockDuration: lockState.lockDuration,
    remainingTime: lockState.remainingTime,
    reason: lockState.reason,
    formattedTime: formatTime(lockState.remainingTime),
  };
}
