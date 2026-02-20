import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useGetAllReports() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllReports();
      } catch (error) {
        console.error('Failed to fetch reports:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch focus scores from the backend with automatic refetching
 * Refetches every 10 seconds for real-time dashboard updates
 */
export function useGetFocusScores() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['focusScores'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getFocusScores();
      } catch (error) {
        console.error('Failed to fetch focus scores:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
    staleTime: 5000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch activity data for LiveMonitor with faster refetch interval
 * Refetches every 5 seconds for real-time activity display
 */
export function useActivityData() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['activityData'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getFocusScores();
      } catch (error) {
        console.error('Failed to fetch activity data:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
    staleTime: 2000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to record focus score data to the backend
 */
export function useRecordFocusScore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      distractionScore,
      tabSwitchCount,
      timeAway,
    }: {
      distractionScore: bigint;
      tabSwitchCount: bigint;
      timeAway: bigint;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.recordFocusScore(distractionScore, tabSwitchCount, timeAway);
    },
    onSuccess: () => {
      // Invalidate both queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['focusScores'] });
      queryClient.invalidateQueries({ queryKey: ['activityData'] });
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
