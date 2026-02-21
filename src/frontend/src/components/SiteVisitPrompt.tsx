import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface SiteVisitPromptProps {
  open: boolean;
  onSelect: (category: 'productive' | 'distructive') => void;
  onDismiss: () => void;
}

export function SiteVisitPrompt({ open, onSelect, onDismiss }: SiteVisitPromptProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome Back!</DialogTitle>
          <DialogDescription>
            Which type of site did you visit while you were away?
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="h-24 flex flex-col gap-2 border-2 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950"
            onClick={() => onSelect('productive')}
          >
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            <span className="font-semibold">Productive Site</span>
            <span className="text-xs text-muted-foreground">Work-related</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-24 flex flex-col gap-2 border-2 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950"
            onClick={() => onSelect('distructive')}
          >
            <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            <span className="font-semibold">Distractive Site</span>
            <span className="text-xs text-muted-foreground">Social, entertainment</span>
          </Button>
        </div>
        
        <p className="text-xs text-center text-muted-foreground">
          Your honest tracking helps Focus Guardian support your productivity goals
        </p>
      </DialogContent>
    </Dialog>
  );
}
