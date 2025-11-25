export type EngineStatus = 'not-ready' | 'ready' | 'error';

export type BestMove = {
  move: string;
  ponder?: string;
};
