import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { SessionSummary } from '../backend';

interface SessionHistoryTableProps {
  sessions: SessionSummary[];
  isLoading?: boolean;
}

export function SessionHistoryTable({ sessions, isLoading }: SessionHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No sessions recorded yet. Start a focus session to begin tracking!
      </p>
    );
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (nanoseconds: bigint) => {
    const minutes = Math.floor(Number(nanoseconds) / (60 * 1000000000));
    return `${minutes}m`;
  };

  const getScoreBadge = (score: bigint) => {
    const scoreNum = Number(score);
    if (scoreNum >= 70) return <Badge variant="default" className="bg-green-600">Good</Badge>;
    if (scoreNum >= 40) return <Badge variant="secondary">Fair</Badge>;
    return <Badge variant="destructive">Needs Work</Badge>;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Distractions</TableHead>
            <TableHead>Switches</TableHead>
            <TableHead>Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.sessionId.toString()}>
              <TableCell className="font-medium">{formatDate(session.startTime)}</TableCell>
              <TableCell>{formatDuration(session.totalDuration)}</TableCell>
              <TableCell>{session.distractionsCount.toString()}</TableCell>
              <TableCell>{session.switchesCount.toString()}</TableCell>
              <TableCell>{getScoreBadge(session.burnoutScore)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
