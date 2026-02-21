import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SessionHistoryTable } from '@/components/SessionHistoryTable';
import { DistractionTrendsChart } from '@/components/DistractionTrendsChart';
import { TransitionMatrix } from '@/components/TransitionMatrix';
import { DurationAnalysisCard } from '@/components/DurationAnalysisCard';
import { BurnoutTrendsChart } from '@/components/BurnoutTrendsChart';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { useDurationAnalysis } from '@/hooks/useDurationAnalysis';
import { History } from 'lucide-react';

export default function SessionHistory() {
  const { 
    sessions, 
    topDistractions, 
    distractionLogs,
    isLoading 
  } = useSessionHistory();

  const {
    durationDistribution,
    habitualDistractions,
    isLoading: durationLoading,
  } = useDurationAnalysis();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <History className="h-8 w-8" />
          Session History & Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Analyze your focus patterns and identify common distractions over time
        </p>
      </div>

      {/* Session History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Sessions</CardTitle>
          <CardDescription>Your focus session history with performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <SessionHistoryTable sessions={sessions} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Distraction Trends */}
        <DistractionTrendsChart sessions={sessions} isLoading={isLoading} />

        {/* Burnout Trends */}
        <BurnoutTrendsChart sessions={sessions} isLoading={isLoading} />
      </div>

      {/* Duration Analysis */}
      <DurationAnalysisCard
        distribution={durationDistribution}
        habitualDistractions={habitualDistractions}
        isLoading={durationLoading}
      />

      {/* Transition Matrix */}
      <TransitionMatrix isLoading={isLoading} />

      {/* Top Distractions */}
      <Card>
        <CardHeader>
          <CardTitle>Most Frequent Distractions</CardTitle>
          <CardDescription>Ranked by occurrence across all sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
          ) : topDistractions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No distractions logged yet
            </p>
          ) : (
            <div className="space-y-3">
              {topDistractions.map(([source, count], index) => (
                <div key={source} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground w-8">#{index + 1}</span>
                    <div>
                      <p className="font-semibold">{source}</p>
                      <p className="text-sm text-muted-foreground">{count.toString()} occurrences</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {sessions.length > 0 
                        ? `${((Number(count) / sessions.length) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">per session</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
