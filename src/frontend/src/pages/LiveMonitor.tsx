import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useActivitySimulator } from '@/hooks/useActivitySimulator';
import { useFocusMonitor } from '@/hooks/useFocusMonitor';
import { Activity, Clock, Zap, TrendingUp } from 'lucide-react';
import { ValidationMetrics } from '@/components/ValidationMetrics';

export default function LiveMonitor() {
  const { currentApp, category, switchCount, switchesPerMinute, switchesPerHour } = useActivitySimulator();
  const { 
    distractionScore, 
    switchCount: realSwitchCount, 
    switchesPerMinute: realSwitchesPerMinute,
    switchesPerHour: realSwitchesPerHour,
    timeAway,
    switchingHistory 
  } = useFocusMonitor();

  const getCategoryColor = (cat: string) => {
    return cat === 'productive' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
  };

  const getCategoryIcon = (cat: string) => {
    return cat === 'productive' ? '✓' : '⚠';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Live Activity Monitor</h2>
        <p className="text-muted-foreground">
          Real-time tracking of your current application and switching patterns
        </p>
      </div>

      {/* Current Activity */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Current Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold mb-2">{currentApp}</p>
              <Badge className={getCategoryColor(category)}>
                {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Switch Count (2min)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{realSwitchCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {realSwitchCount > 5 ? 'High frequency' : 'Normal'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Switches/Minute
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{realSwitchesPerMinute.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {realSwitchesPerMinute > 2 ? 'Above average' : 'Good focus'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Away
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.floor(timeAway / 1000)}s</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total time away
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Distraction Score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{distractionScore}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {distractionScore < 3 ? 'Low' : distractionScore < 6 ? 'Medium' : 'High'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Validation Metrics Section */}
      <ValidationMetrics 
        switchingHistory={switchingHistory}
        currentDistractionScore={distractionScore}
        totalSwitches={realSwitchCount}
        switchesPerMinute={realSwitchesPerMinute}
        switchesPerHour={realSwitchesPerHour}
      />
    </div>
  );
}
