import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { SessionSummary } from '../backend';

interface BurnoutTrendsChartProps {
  sessions: SessionSummary[];
  isLoading?: boolean;
}

export function BurnoutTrendsChart({ sessions, isLoading }: BurnoutTrendsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Burnout Trends</CardTitle>
          <CardDescription>Historical burnout scores over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = sessions
    .slice(-10)
    .map((session, index) => ({
      session: `#${index + 1}`,
      score: Number(session.burnoutScore),
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Burnout Trends</CardTitle>
        <CardDescription>Historical burnout scores (last 10 sessions)</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No session data yet. Complete sessions to track burnout trends!
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="session" className="text-xs" />
              <YAxis className="text-xs" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <ReferenceLine y={30} stroke="hsl(var(--green-600))" strokeDasharray="3 3" label="Low" />
              <ReferenceLine y={60} stroke="hsl(var(--yellow-600))" strokeDasharray="3 3" label="Medium" />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
