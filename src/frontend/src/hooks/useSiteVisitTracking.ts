import { useState, useEffect, useCallback } from 'react';

interface SiteVisit {
  timestamp: number;
  category: 'productive' | 'distructive';
}

const STORAGE_KEY = 'focus-guardian-site-visits';
const MIN_AWAY_TIME = 5000; // 5 seconds in milliseconds

export function useSiteVisitTracking() {
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [showPrompt, setShowPrompt] = useState(false);
  const [awayStartTime, setAwayStartTime] = useState<number | null>(null);
  const [destructiveVisitCount, setDestructiveVisitCount] = useState(0);

  // Load visits from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setVisits(parsed.visits || []);
      setDestructiveVisitCount(parsed.destructiveCount || 0);
    }
  }, []);

  // Save visits to localStorage
  const saveVisits = useCallback((newVisits: SiteVisit[], destructiveCount: number) => {
    setVisits(newVisits);
    setDestructiveVisitCount(destructiveCount);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      visits: newVisits,
      destructiveCount,
    }));
  }, []);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User left the tab
        setAwayStartTime(Date.now());
      } else {
        // User returned to the tab
        if (awayStartTime) {
          const timeAway = Date.now() - awayStartTime;
          if (timeAway >= MIN_AWAY_TIME) {
            setShowPrompt(true);
          }
          setAwayStartTime(null);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [awayStartTime]);

  // Record a site visit
  const recordVisit = useCallback(async (category: 'productive' | 'distructive') => {
    const visit: SiteVisit = {
      timestamp: Date.now(),
      category,
    };

    const newVisits = [...visits, visit];
    const newDestructiveCount = category === 'distructive' 
      ? destructiveVisitCount + 1 
      : destructiveVisitCount;

    saveVisits(newVisits, newDestructiveCount);
    setShowPrompt(false);
  }, [visits, destructiveVisitCount, saveVisits]);

  // Reset session data
  const resetSession = useCallback(() => {
    saveVisits([], 0);
  }, [saveVisits]);

  return {
    visits,
    destructiveVisitCount,
    showPrompt,
    recordVisit,
    resetSession,
    dismissPrompt: () => setShowPrompt(false),
  };
}
