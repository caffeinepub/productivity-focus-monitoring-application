import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useActivitySimulator } from '@/hooks/useActivitySimulator';
import { useFocusTimer } from '@/hooks/useFocusTimer';
import { Activity, Clock, Zap, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LiveMonitor() {
  const { currentApp, category, switchCount, switchesPerMinute, switchesPerHour, isActive } =
    useActivitySimulator();
  const { focusDuration, formattedTime } = useFocusTimer(isActive);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Live Activity Monitor</h2>
        <p className="text-muted-foreground">
          Real-time tracking of your focus and attention patterns
        </p>
      </div>

      {/* Current Activity */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Monitor className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Current Application</CardTitle>
                <CardDescription>What you're working on right now</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-3 w-3 rounded-full animate-pulse',
                  isActive ? 'bg-green-500' : 'bg-muted'
                )}
              />
              <span className="text-sm text-muted-foreground">
                {isActive ? 'Active' : 'Idle'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold mb-2">{currentApp}</p>
              <Badge
                variant={category === 'productive' ? 'default' : 'secondary'}
                className={cn(
                  category === 'productive'
                    ? 'bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20'
                )}
              >
                {category === 'productive' ? '✓ Productive' : '⚠ Distracting'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Continuous Focus</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formattedTime}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {focusDuration > 1500 ? 'Great focus session!' : 'Keep going!'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Switches/Minute</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{switchesPerMinute.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {switchesPerMinute < 2 ? 'Excellent focus' : 'Try to reduce switching'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Total Switches</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{switchCount}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {switchesPerHour.toFixed(0)} per hour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Insights</CardTitle>
          <CardDescription>Understanding your work patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 mt-1">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium mb-1">Context Switching Pattern</p>
              <p className="text-sm text-muted-foreground">
                {switchesPerMinute < 1
                  ? 'You\'re maintaining excellent focus with minimal context switching. Keep up the great work!'
                  : switchesPerMinute < 2
                  ? 'Your switching frequency is moderate. Consider taking a short break if you feel scattered.'
                  : 'High switching frequency detected. This might indicate cognitive overload. Consider a desk recovery break.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 mt-1">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium mb-1">Focus Duration</p>
              <p className="text-sm text-muted-foreground">
                {focusDuration < 600
                  ? 'Just getting started. The first 10 minutes are often the hardest!'
                  : focusDuration < 1500
                  ? 'You\'re building momentum. Try to reach the 25-minute mark for a complete focus session.'
                  : 'Outstanding! You\'ve achieved deep work. Consider taking a well-deserved break soon.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
