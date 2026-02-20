import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, TrendingUp } from 'lucide-react';
import { useFocusMonitor } from '@/hooks/useFocusMonitor';
import { ValidationMetrics } from '@/components/ValidationMetrics';
import { useEffect, useState } from 'react';

export default function LiveMonitor() {
  const {
    distractionScore,
    switchCount,
    switchesPerMinute,
    switchesPerHour,
    timeAway,
    isAway,
    switchingHistory,
    categorizedSwitchingHistory,
  } = useFocusMonitor();

  const [currentApp, setCurrentApp] = useState('Focus Guardian Dashboard');

  useEffect(() => {
    const updateCurrentApp = () => {
      if (document.hidden) {
        setCurrentApp('Away from tab');
      } else {
        setCurrentApp('Focus Guardian Dashboard');
      }
    };

    document.addEventListener('visibilitychange', updateCurrentApp);
    return () => document.removeEventListener('visibilitychange', updateCurrentApp);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Live Activity Monitor</h1>
        <p className="text-muted-foreground mt-2">
          Real-time tracking of your focus and switching behavior
        </p>
      </div>

      {/* Current Activity Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Activity</CardTitle>
              <CardDescription>What you're working on right now</CardDescription>
            </div>
            <Badge variant={isAway ? 'destructive' : 'default'} className="text-sm px-3 py-1">
              {isAway ? 'Away' : 'Active'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{currentApp}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isAway ? 'You switched away from this tab' : 'Currently viewing'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Tab Switches</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{switchCount}</p>
            <p className="text-xs text-muted-foreground mt-1">In last 2 minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Time Away</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{timeAway}s</p>
            <p className="text-xs text-muted-foreground mt-1">Total time away</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Distraction Score</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{distractionScore}</p>
            <p className="text-xs text-muted-foreground mt-1">Current level</p>
          </CardContent>
        </Card>
      </div>

      {/* Validation Metrics Section */}
      <ValidationMetrics
        switchingHistory={switchingHistory}
        currentDistractionScore={distractionScore}
        totalSwitches={switchCount}
        switchesPerMinute={switchesPerMinute}
        switchesPerHour={switchesPerHour}
        categorizedSwitchingHistory={categorizedSwitchingHistory}
      />
    </div>
  );
}
