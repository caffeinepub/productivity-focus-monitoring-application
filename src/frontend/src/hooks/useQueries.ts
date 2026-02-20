import { useQuery } from '@tanstack/react-query';
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
