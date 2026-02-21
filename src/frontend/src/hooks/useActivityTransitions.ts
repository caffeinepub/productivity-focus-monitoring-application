import { useState } from 'react';
import { useActor } from './useActor';
import { useGetActivitySwitches } from './useQueries';
import { Category } from '../backend';

interface Activity {
  name: string;
  category: 'productive' | 'distracting' | 'neutral';
}

export function useActivityTransitions() {
  const { actor } = useActor();
  const { data: switches = [], isLoading } = useGetActivitySwitches();
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);

  const recordTransition = async (
    fromApp: string,
    toApp: string,
    fromCategory: 'productive' | 'distracting' | 'neutral',
    toCategory: 'productive' | 'distracting' | 'neutral'
  ) => {
    if (!actor) return;

    try {
      const fromCat: Category = 
        fromCategory === 'productive' ? Category.productive :
        fromCategory === 'distracting' ? Category.distracting :
        Category.neutral;

      const toCat: Category = 
        toCategory === 'productive' ? Category.productive :
        toCategory === 'distracting' ? Category.distracting :
        Category.neutral;

      await actor.recordActivitySwitch(fromApp, toApp, fromCat, toCat);
    } catch (error) {
      console.error('Failed to record activity transition:', error);
    }
  };

  // Analyze switches for repeated patterns (3+ occurrences)
  const transitionCounts = new Map<string, number>();
  switches.forEach((sw) => {
    const key = `${sw.fromApp}→${sw.toApp}`;
    transitionCounts.set(key, (transitionCounts.get(key) || 0) + 1);
  });

  const topInterruptions = Array.from(transitionCounts.entries())
    .filter(([_, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return {
    currentActivity,
    setCurrentActivity,
    recordTransition,
    switches,
    topInterruptions,
    isLoading,
  };
}
