import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MetricsCard } from '@/components/MetricsCard';
import { ProductivityScore } from '@/components/ProductivityScore';
import { DailyRecommendations } from '@/components/DailyRecommendations';
import { RecoveryQualityChart } from '@/components/RecoveryQualityChart';
import { DistractionWarning } from '@/components/DistractionWarning';
import { BurnoutBreakdownChart } from '@/components/BurnoutBreakdownChart';
import { SwitchingBreakdown } from '@/components/SwitchingBreakdown';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useFocusMonitor } from '@/hooks/useFocusMonitor';
import { useBurnoutMonitor } from '@/hooks/useBurnoutMonitor';
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
  const { 
    distractionScore, 
    switchCount, 
    switchesPerMinute,
    productiveToProductive,
    productiveToDistracting,
    distractingToProductive,
    distractingToDistracting,
  } = useFocusMonitor();

  // Get burnout metrics with formula breakdown
  const { 
    burnoutIndex, 
    timeBasedContribution, 
    switchingContribution 
  } = useBurnoutMonitor();

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

  // Loading state with skeletons
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 md:p-12">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-24 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 md:p-12">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Welcome back! 👋
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Here's your productivity overview for today
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
          <img
            src="/assets/generated/dashboard-hero.dim_800x400.png"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Metrics Cards */}
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
          trend="+8%"
          trendUp={false}
        />
        <MetricsCard
          title="Tab Switches"
          value={switchCount.toString()}
          icon={Activity}
          trend="+5%"
          trendUp={false}
        />
        <MetricsCard
          title="Burnout Index"
          value={burnoutIndex.toString()}
          icon={TrendingUp}
          trend={burnoutIndex < 40 ? "-3%" : "+3%"}
          trendUp={burnoutIndex < 40}
        />
      </div>

      {/* Website Switching Breakdown */}
      <SwitchingBreakdown
        productiveToProductive={productiveToProductive}
        productiveToDistracting={productiveToDistracting}
        distractingToProductive={distractingToProductive}
        distractingToDistracting={distractingToDistracting}
      />

      {/* Burnout Breakdown Chart */}
      <BurnoutBreakdownChart
        timeBasedContribution={timeBasedContribution}
        switchingContribution={switchingContribution}
        totalBurnoutIndex={burnoutIndex}
      />

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Productivity Score */}
        <ProductivityScore score={productivityScore} />

        {/* Recovery Quality */}
        <RecoveryQualityChart />
      </div>

      {/* Burnout Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Burnout Trend</CardTitle>
          <CardDescription>Your burnout index over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={burnoutTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Recommendations */}
      <DailyRecommendations recommendations={recommendations} />

      {/* Distraction Warning */}
      <DistractionWarning
        visible={showWarning}
        switchCount={switchCount}
        onDismiss={handleDismissWarning}
      />
    </div>
  );
}
