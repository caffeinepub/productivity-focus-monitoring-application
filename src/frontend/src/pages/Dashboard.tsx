import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MetricsCard } from '@/components/MetricsCard';
import { BurnoutScoreCard } from '@/components/BurnoutScoreCard';
import { TransitionPatternsCard } from '@/components/TransitionPatternsCard';
import { useBurnoutScore } from '@/hooks/useBurnoutScore';
import { useActivityTransitions } from '@/hooks/useActivityTransitions';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { Clock, Target, TrendingUp, Play, History } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentScore, scoreLevel, isLoading: burnoutLoading } = useBurnoutScore();
  const { topInterruptions, isLoading: transitionsLoading } = useActivityTransitions();
  const { recentSessions, topDistractions, isLoading: historyLoading } = useSessionHistory();

  const totalSessions = recentSessions.length;
  const totalFocusTime = recentSessions.reduce((sum, session) => {
    return sum + Number(session.totalDuration) / (60 * 1000000000);
  }, 0);
  const avgDistractions = totalSessions > 0
    ? recentSessions.reduce((sum, s) => sum + Number(s.distractionsCount), 0) / totalSessions
    : 0;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 md:p-12">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome to Focus Tracker</h2>
          <p className="text-lg text-muted-foreground">
            Track your productivity with customizable timers and manual distraction logging
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-20">
          <img
            src="/assets/generated/dashboard-hero.dim_800x400.png"
            alt="Focus"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Start a Focus Session</h3>
                <p className="text-sm text-muted-foreground">
                  Begin a productivity timer with customizable work and break intervals
                </p>
              </div>
              <Button 
                size="lg" 
                onClick={() => navigate({ to: '/focus-session' })}
                className="gap-2"
              >
                <Play className="h-5 w-5" />
                Start Session
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-muted">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">View Session History</h3>
                <p className="text-sm text-muted-foreground">
                  Analyze your patterns and identify common distractions
                </p>
              </div>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate({ to: '/session-history' })}
                className="gap-2"
              >
                <History className="h-5 w-5" />
                View History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Burnout Score */}
      <BurnoutScoreCard 
        score={currentScore} 
        level={scoreLevel}
        isLoading={burnoutLoading}
      />

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <MetricsCard
          title="Total Sessions"
          value={totalSessions.toString()}
          icon={Target}
          trend={totalSessions > 0 ? 'Active' : 'Get started'}
          trendUp={totalSessions > 0}
        />
        <MetricsCard
          title="Total Focus Time"
          value={`${Math.round(totalFocusTime)}m`}
          icon={Clock}
          trend={`${totalSessions} sessions`}
          trendUp={true}
        />
        <MetricsCard
          title="Avg Distractions"
          value={avgDistractions.toFixed(1)}
          icon={TrendingUp}
          trend={avgDistractions < 5 ? 'Good focus' : 'Room to improve'}
          trendUp={avgDistractions < 5}
        />
      </div>

      {/* Transition Patterns */}
      <TransitionPatternsCard 
        patterns={topInterruptions}
        isLoading={transitionsLoading}
      />

      {/* Top Distractions */}
      <Card>
        <CardHeader>
          <CardTitle>Most Frequent Distractions</CardTitle>
          <CardDescription>Your most common interruption sources</CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
          ) : topDistractions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No distractions logged yet. Start a focus session to begin tracking!
            </p>
          ) : (
            <div className="space-y-3">
              {topDistractions.slice(0, 5).map(([source, count], index) => (
                <div key={source} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                    <span className="font-medium">{source}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{count.toString()} times</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
