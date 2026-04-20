import React, { useRef, useEffect } from 'react';
import { Move } from 'chess.js';

interface MoveHistoryProps {
  moves: Move[];
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
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
    <div
      ref={scrollRef}
      className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide py-1.5 px-2 bg-card border border-border rounded-lg min-h-[36px]"
    >
      {pairs.length === 0 ? (
        <span className="text-xs text-muted-foreground whitespace-nowrap">No moves yet</span>
      ) : (
        pairs.map((pair) => (
          <React.Fragment key={pair.num}>
            <span className="text-[10px] text-muted-foreground shrink-0">{pair.num}.</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded shrink-0 font-medium transition-colors ${
                moves.length === pair.num * 2 - 1
                  ? 'bg-primary/15 text-primary'
                  : 'text-foreground hover:bg-secondary'
              }`}
            >
              {pair.white}
            </span>
            {pair.black && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded shrink-0 font-medium transition-colors ${
                  moves.length === pair.num * 2
                    ? 'bg-primary/15 text-primary'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                {pair.black}
              </span>
            )}
          </React.Fragment>
        ))
      )}
    </div>
  );
};

export default MoveHistory;
