import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, TrendingUp } from 'lucide-react';

interface TransitionPatternsCardProps {
  patterns: Array<[string, number]>;
  isLoading?: boolean;
}

export function TransitionPatternsCard({ patterns, isLoading }: TransitionPatternsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Common Interruption Patterns</CardTitle>
          <CardDescription>Repeated activity transitions (3+ occurrences)</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Common Interruption Patterns
        </CardTitle>
        <CardDescription>Repeated activity transitions (3+ occurrences)</CardDescription>
      </CardHeader>
      <CardContent>
        {patterns.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No repeated patterns detected yet. Keep logging distractions to identify trends!
          </p>
        ) : (
          <div className="space-y-3">
            {patterns.slice(0, 5).map(([transition, count]) => {
              const [from, to] = transition.split('→');
              return (
                <div key={transition} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-medium text-sm truncate max-w-[120px]">{from}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium text-sm truncate max-w-[120px]">{to}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{count} times</span>
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
