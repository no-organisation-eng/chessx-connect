import React, { useRef, useEffect } from 'react';
import { Move } from 'chess.js';

interface MoveHistoryProps {
  moves: Move[];
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves.length]);

  const pairs: { num: number; white: string; black?: string }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i].san,
      black: moves[i + 1]?.san,
    });
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-2 border-b border-border">
        <h3 className="font-display text-xs tracking-widest uppercase text-muted-foreground">
          Moves
        </h3>
      </div>
      <div ref={scrollRef} className="max-h-[280px] overflow-y-auto p-2">
        {pairs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Game hasn't started yet
          </p>
        ) : (
          <div className="space-y-0.5">
            {pairs.map((pair) => (
              <div
                key={pair.num}
                className="grid grid-cols-[2rem_1fr_1fr] gap-1 text-sm"
              >
                <span className="text-muted-foreground text-right pr-2">
                  {pair.num}.
                </span>
                <span
                  className={`px-2 py-0.5 rounded cursor-default hover:bg-secondary transition-colors ${
                    moves.length === pair.num * 2 - 1 ? 'bg-primary/10 text-primary' : 'text-foreground'
                  }`}
                >
                  {pair.white}
                </span>
                {pair.black && (
                  <span
                    className={`px-2 py-0.5 rounded cursor-default hover:bg-secondary transition-colors ${
                      moves.length === pair.num * 2 ? 'bg-primary/10 text-primary' : 'text-foreground'
                    }`}
                  >
                    {pair.black}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoveHistory;
