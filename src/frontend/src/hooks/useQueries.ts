import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { SessionSummary, DistractionLog, ActivitySwitch } from '../backend';

export function useGetSessionSummaries() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['sessionSummaries'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const summaries = await actor.getSessionSummaries();
        return summaries.map(([_, summary]) => summary);
      } catch (error) {
        console.error('Failed to fetch session summaries:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });
}

export function useGetDistractionLogs() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['distractionLogs'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const logs = await actor.getDistractionLogs();
        return logs.map(([_, log]) => log);
      } catch (error) {
        console.error('Failed to fetch distraction logs:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });
}

export function useGetActivitySwitches() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['activitySwitches'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const switches = await actor.getActivitySwitches();
        return switches.map(([_, sw]) => sw);
      } catch (error) {
        console.error('Failed to fetch activity switches:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });
}

export function useGetMostFrequentDistractions() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['mostFrequentDistractions'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMostFrequentDistractions();
      } catch (error) {
        console.error('Failed to fetch frequent distractions:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });
}

export function useGetCurrentSessionStats() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['currentSessionStats'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const [productiveTime, distractingTime, startTime, distractionsCount, switchesCount] = 
          await actor.getCurrentSessionStats();
        return {
          productiveTime,
          distractingTime,
          startTime,
          distractionsCount,
          switchesCount,
        };
      } catch (error) {
        console.error('Failed to fetch current session stats:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });
}

export function useGetAllAppCategories() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['appCategories'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllAppCategories();
      } catch (error) {
        console.error('Failed to fetch app categories:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });
}
