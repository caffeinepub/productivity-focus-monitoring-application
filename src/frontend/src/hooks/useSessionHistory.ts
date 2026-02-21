import { useGetSessionSummaries, useGetMostFrequentDistractions, useGetDistractionLogs } from './useQueries';

export function useSessionHistory() {
  const { data: summaries = [], isLoading: summariesLoading } = useGetSessionSummaries();
  const { data: topDistractions = [], isLoading: distractionsLoading } = useGetMostFrequentDistractions();
  const { data: distractionLogs = [], isLoading: logsLoading } = useGetDistractionLogs();

  // Sort sessions by start time (most recent first)
  const sessions = [...summaries].sort((a, b) => Number(b.startTime) - Number(a.startTime));

  const recentSessions = sessions.slice(0, 10);

  return {
    sessions,
    recentSessions,
    topDistractions,
    distractionLogs,
    isLoading: summariesLoading || distractionsLoading || logsLoading,
  };
}
