import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DistractionLogModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (source: string, category: 'productive' | 'distracting' | 'neutral', sourceType: string, description: string) => Promise<void>;
}

export function DistractionLogModal({ open, onClose, onSubmit }: DistractionLogModalProps) {
  const [source, setSource] = useState('');
  const [category, setCategory] = useState<'productive' | 'distracting' | 'neutral'>('distracting');
  const [sourceType, setSourceType] = useState('socialMedia');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!source.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(source.trim(), category, sourceType, description.trim());
      // Reset form
      setSource('');
      setCategory('distracting');
      setSourceType('socialMedia');
      setDescription('');
    } catch (error) {
      console.error('Failed to log distraction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Distraction</DialogTitle>
          <DialogDescription>
            Record what interrupted your focus to track patterns over time
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="source">App or Website Name</Label>
            <Input
              id="source"
              placeholder="e.g., YouTube, Instagram, Slack"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(val: 'productive' | 'distracting' | 'neutral') => setCategory(val)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="productive">Productive</SelectItem>
                <SelectItem value="distracting">Distracting</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="sourceType">Type</Label>
            <Select value={sourceType} onValueChange={setSourceType}>
              <SelectTrigger id="sourceType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="socialMedia">Social Media</SelectItem>
                <SelectItem value="workApp">Work App</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Notes (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any additional context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSubmit} disabled={!source.trim() || isSubmitting} className="flex-1">
              {isSubmitting ? 'Logging...' : 'Log Distraction'}
            </Button>
            <Button onClick={onClose} variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
