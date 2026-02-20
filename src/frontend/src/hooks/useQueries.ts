import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useGetAllReports() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReports();
    },
    enabled: !!actor && !isFetching,
  });
}

/**
 * Hook to fetch focus scores from the backend
 */
export function useGetFocusScores() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['focusScores'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFocusScores();
    },
    enabled: !!actor && !isFetching,
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
      // Invalidate focus scores query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['focusScores'] });
    },
  });
}
