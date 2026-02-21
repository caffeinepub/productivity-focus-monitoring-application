import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SessionSummary } from '../backend';

interface DistractionTrendsChartProps {
  sessions: SessionSummary[];
  isLoading?: boolean;
}

export function DistractionTrendsChart({ sessions, isLoading }: DistractionTrendsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distraction Trends</CardTitle>
          <CardDescription>Daily distraction frequency over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Group sessions by day and calculate average distractions
  const dailyData = new Map<string, { total: number; count: number }>();
  
  sessions.forEach((session) => {
    const date = new Date(Number(session.startTime) / 1000000);
    const dateKey = date.toLocaleDateString();
    const current = dailyData.get(dateKey) || { total: 0, count: 0 };
    dailyData.set(dateKey, {
      total: current.total + Number(session.distractionsCount),
      count: current.count + 1,
    });
  });

  const chartData = Array.from(dailyData.entries())
    .map(([date, data]) => ({
      date,
      distractions: Math.round(data.total / data.count),
    }))
    .slice(-7); // Last 7 days

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distraction Trends</CardTitle>
        <CardDescription>Average distractions per session over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Not enough data yet. Complete more sessions to see trends!
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
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
                dataKey="distractions"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--destructive))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
