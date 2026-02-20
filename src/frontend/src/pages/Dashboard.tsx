import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricsCard } from '@/components/MetricsCard';
import { ProductivityScore } from '@/components/ProductivityScore';
import { DailyRecommendations } from '@/components/DailyRecommendations';
import { RecoveryQualityChart } from '@/components/RecoveryQualityChart';
import { DistractionWarning } from '@/components/DistractionWarning';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useFocusMonitor } from '@/hooks/useFocusMonitor';
import { Clock, Zap, Activity, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const {
    focusTime,
    distractionTime,
    switchingFrequency,
    burnoutTrend,
    productivityScore,
    recommendations,
    isLoading,
  } = useDashboardData();

  // Monitor focus and tab switching behavior
  const { distractionScore, switchCount, switchesPerMinute } = useFocusMonitor();

  // Track whether to show the distraction warning
  const [showWarning, setShowWarning] = useState(false);
  const [warningCooldown, setWarningCooldown] = useState(false);

  /**
   * Show warning when distraction score exceeds threshold (3)
   * and we're not in cooldown period
   */
  useEffect(() => {
    if (distractionScore >= 3 && !warningCooldown && !showWarning) {
      setShowWarning(true);
    }
  }, [distractionScore, warningCooldown, showWarning]);

  /**
   * Handle warning dismissal with cooldown period
   * Prevents warning from appearing too frequently
   */
  const handleDismissWarning = () => {
    setShowWarning(false);
    setWarningCooldown(true);
    
    // Reset cooldown after 5 minutes
    setTimeout(() => {
      setWarningCooldown(false);
    }, 5 * 60 * 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 md:p-12">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome back!</h2>
          <p className="text-lg text-muted-foreground">
            Let's review your focus journey and celebrate your progress.
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

      {/* Productivity Score */}
      <ProductivityScore score={productivityScore} />

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Focus Time"
          value={focusTime}
          icon={Clock}
          trend="+12%"
          trendUp={true}
        />
        <MetricsCard
          title="Distraction Time"
          value={distractionTime}
          icon={Zap}
          trend="-8%"
          trendUp={true}
        />
        <MetricsCard
          title="Switch Frequency"
          value={`${switchingFrequency}/hr`}
          icon={Activity}
          trend="-15%"
          trendUp={true}
        />
        <MetricsCard
          title="Productivity"
          value={`${productivityScore}%`}
          icon={TrendingUp}
          trend="+5%"
          trendUp={true}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Burnout Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Burnout Index Trend</CardTitle>
            <CardDescription>Your cognitive load over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={burnoutTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="burnout"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-1))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recovery Quality */}
        <RecoveryQualityChart />
      </div>

      {/* Daily Recommendations */}
      <DailyRecommendations recommendations={recommendations} />

      {/* Distraction Warning - appears when threshold is exceeded */}
      <DistractionWarning
        visible={showWarning}
        onDismiss={handleDismissWarning}
        switchCount={switchCount}
      />
    </div>
  );
}
