import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Clock } from 'lucide-react';

interface DurationAnalysisCardProps {
  distribution: {
    sustainedFocus: number;
    briefBrowsing: number;
    habitChecking: number;
  };
  habitualDistractions: Array<{
    source: string;
    count: number;
    avgDuration: number;
  }>;
  isLoading?: boolean;
}

export function DurationAnalysisCard({ distribution, habitualDistractions, isLoading }: DurationAnalysisCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Duration Analysis</CardTitle>
          <CardDescription>Activity classification by duration patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: 'Sustained Focus (25+ min)', value: distribution.sustainedFocus, color: 'hsl(var(--green-600))' },
    { name: 'Brief Browsing (5-10 min)', value: distribution.briefBrowsing, color: 'hsl(var(--yellow-600))' },
    { name: 'Habit Checking (<1 min)', value: distribution.habitChecking, color: 'hsl(var(--red-600))' },
  ].filter((item) => item.value > 0);

  const total = distribution.sustainedFocus + distribution.briefBrowsing + distribution.habitChecking;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Duration Analysis
        </CardTitle>
        <CardDescription>Activity classification by duration patterns</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No session data yet. Complete sessions to see duration analysis!
          </p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold mb-4">Session Duration Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4">Habitual Distractions</h3>
              {habitualDistractions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No habitual patterns detected yet
                </p>
              ) : (
                <div className="space-y-2">
                  {habitualDistractions.map((distraction) => (
                    <div key={distraction.source} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                      <span className="font-medium text-sm">{distraction.source}</span>
                      <span className="text-xs text-muted-foreground">{distraction.count} times</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-4">
                * Habitual distractions are sources visited 3+ times with short durations
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
