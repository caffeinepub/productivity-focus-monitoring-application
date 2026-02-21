import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetActivitySwitches } from '@/hooks/useQueries';
import { ArrowRight } from 'lucide-react';

interface TransitionMatrixProps {
  isLoading?: boolean;
}

export function TransitionMatrix({ isLoading: externalLoading }: TransitionMatrixProps) {
  const { data: switches = [], isLoading: switchesLoading } = useGetActivitySwitches();

  const isLoading = externalLoading || switchesLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Transition Matrix</CardTitle>
          <CardDescription>Most common activity switching pathways</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Build transition frequency map
  const transitionMap = new Map<string, number>();
  switches.forEach((sw) => {
    const key = `${sw.fromApp}→${sw.toApp}`;
    transitionMap.set(key, (transitionMap.get(key) || 0) + 1);
  });

  const topTransitions = Array.from(transitionMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Transition Matrix</CardTitle>
        <CardDescription>Most common activity switching pathways</CardDescription>
      </CardHeader>
      <CardContent>
        {topTransitions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No transitions recorded yet. Log distractions during sessions to see patterns!
          </p>
        ) : (
          <div className="grid gap-2">
            {topTransitions.map(([transition, count]) => {
              const [from, to] = transition.split('→');
              const intensity = Math.min(100, (count / topTransitions[0][1]) * 100);
              
              return (
                <div
                  key={transition}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  style={{
                    backgroundColor: `hsl(var(--primary) / ${intensity * 0.15}%)`,
                  }}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-medium text-sm truncate max-w-[150px]">{from}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium text-sm truncate max-w-[150px]">{to}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{count}</span>
                    <span className="text-xs text-muted-foreground">switches</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
