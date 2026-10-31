export interface ListResult<T> {
  rows: T[];
  total: number;
}

export type Row = Record<string, unknown> & { id: string };
