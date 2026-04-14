import React from 'react';
import { Bot, User } from 'lucide-react';
import type { AIDifficulty } from '@/hooks/useChessAI';

interface AIControlsProps {
  aiEnabled: boolean;
  aiDifficulty: AIDifficulty;
  aiThinking: boolean;
  onToggleAI: () => void;
  onDifficultyChange: (d: AIDifficulty) => void;
}

const DIFFICULTIES: { value: AIDifficulty; label: string; color: string }[] = [
  { value: 'easy', label: 'Easy', color: 'text-primary' },
  { value: 'medium', label: 'Med', color: 'text-accent' },
  { value: 'hard', label: 'Hard', color: 'text-destructive' },
];

const AIControls: React.FC<AIControlsProps> = ({
  aiEnabled,
  aiDifficulty,
  aiThinking,
  onToggleAI,
  onDifficultyChange,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-display text-xs tracking-widest uppercase text-muted-foreground">
          Opponent
        </span>
        <button
          onClick={onToggleAI}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            aiEnabled
              ? 'bg-primary/15 text-primary border border-primary/30'
              : 'bg-secondary text-secondary-foreground border border-border'
          }`}
        >
          {aiEnabled ? <Bot size={14} /> : <User size={14} />}
          {aiEnabled ? 'AI' : 'Human'}
        </button>
      </div>

      {aiEnabled && (
        <div className="flex gap-1.5">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              onClick={() => onDifficultyChange(d.value)}
              disabled={aiThinking}
              className={`flex-1 px-2 py-1.5 rounded text-xs font-display tracking-wider transition-all ${
                aiDifficulty === d.value
                  ? `bg-secondary ${d.color} border border-current/20`
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}

      {aiEnabled && aiThinking && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="font-body">Thinking...</span>
        </div>
      )}
    </div>
  );
};

export default AIControls;
