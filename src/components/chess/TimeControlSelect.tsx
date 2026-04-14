import React from 'react';
import { Clock } from 'lucide-react';
import { TIME_CONTROLS } from '@/hooks/useChessTimer';

interface TimeControlSelectProps {
  selected: string;
  onChange: (name: string) => void;
  disabled?: boolean;
}

const TimeControlSelect: React.FC<TimeControlSelectProps> = ({ selected, onChange, disabled }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Clock size={14} className="text-muted-foreground" />
        <span className="font-display text-xs tracking-widest uppercase text-muted-foreground">
          Time Control
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {Object.keys(TIME_CONTROLS).map((name) => (
          <button
            key={name}
            onClick={() => onChange(name)}
            disabled={disabled}
            className={`px-2 py-1.5 rounded text-xs font-body transition-all ${
              selected === name
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeControlSelect;
