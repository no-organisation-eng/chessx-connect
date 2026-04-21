// Cburnett (Lichess default, public domain)
import wpC from '@/assets/pieces/cburnett/wp.svg?url';
import wnC from '@/assets/pieces/cburnett/wn.svg?url';
import wbC from '@/assets/pieces/cburnett/wb.svg?url';
import wrC from '@/assets/pieces/cburnett/wr.svg?url';
import wqC from '@/assets/pieces/cburnett/wq.svg?url';
import wkC from '@/assets/pieces/cburnett/wk.svg?url';
import bpC from '@/assets/pieces/cburnett/bp.svg?url';
import bnC from '@/assets/pieces/cburnett/bn.svg?url';
import bbC from '@/assets/pieces/cburnett/bb.svg?url';
import brC from '@/assets/pieces/cburnett/br.svg?url';
import bqC from '@/assets/pieces/cburnett/bq.svg?url';
import bkC from '@/assets/pieces/cburnett/bk.svg?url';

// Merida
import wpM from '@/assets/pieces/merida/wp.svg?url';
import wnM from '@/assets/pieces/merida/wn.svg?url';
import wbM from '@/assets/pieces/merida/wb.svg?url';
import wrM from '@/assets/pieces/merida/wr.svg?url';
import wqM from '@/assets/pieces/merida/wq.svg?url';
import wkM from '@/assets/pieces/merida/wk.svg?url';
import bpM from '@/assets/pieces/merida/bp.svg?url';
import bnM from '@/assets/pieces/merida/bn.svg?url';
import bbM from '@/assets/pieces/merida/bb.svg?url';
import brM from '@/assets/pieces/merida/br.svg?url';
import bqM from '@/assets/pieces/merida/bq.svg?url';
import bkM from '@/assets/pieces/merida/bk.svg?url';

// Pixel (8-bit)
import wpP from '@/assets/pieces/pixel/wp.svg?url';
import wnP from '@/assets/pieces/pixel/wn.svg?url';
import wbP from '@/assets/pieces/pixel/wb.svg?url';
import wrP from '@/assets/pieces/pixel/wr.svg?url';
import wqP from '@/assets/pieces/pixel/wq.svg?url';
import wkP from '@/assets/pieces/pixel/wk.svg?url';
import bpP from '@/assets/pieces/pixel/bp.svg?url';
import bnP from '@/assets/pieces/pixel/bn.svg?url';
import bbP from '@/assets/pieces/pixel/bb.svg?url';
import brP from '@/assets/pieces/pixel/br.svg?url';
import bqP from '@/assets/pieces/pixel/bq.svg?url';
import bkP from '@/assets/pieces/pixel/bk.svg?url';

export type PieceKey = 'wp'|'wn'|'wb'|'wr'|'wq'|'wk'|'bp'|'bn'|'bb'|'br'|'bq'|'bk';
export type PieceSetId = 'cburnett' | 'merida' | 'pixel' | 'unicode';

export interface PieceSet {
  id: PieceSetId;
  name: string;
  pieces: Record<PieceKey, string> | null;
}

export const PIECE_SETS: Record<PieceSetId, PieceSet> = {
  cburnett: {
    id: 'cburnett',
    name: 'Cburnett',
    pieces: { wp: wpC, wn: wnC, wb: wbC, wr: wrC, wq: wqC, wk: wkC, bp: bpC, bn: bnC, bb: bbC, br: brC, bq: bqC, bk: bkC },
  },
  merida: {
    id: 'merida',
    name: 'Merida',
    pieces: { wp: wpM, wn: wnM, wb: wbM, wr: wrM, wq: wqM, wk: wkM, bp: bpM, bn: bnM, bb: bbM, br: brM, bq: bqM, bk: bkM },
  },
  pixel: {
    id: 'pixel',
    name: 'Pixel',
    pieces: { wp: wpP, wn: wnP, wb: wbP, wr: wrP, wq: wqP, wk: wkP, bp: bpP, bn: bnP, bb: bbP, br: brP, bq: bqP, bk: bkP },
  },
  unicode: {
    id: 'unicode',
    name: 'Classic',
    pieces: null,
  },
};

export const DEFAULT_PIECE_SET: PieceSetId = 'cburnett';
