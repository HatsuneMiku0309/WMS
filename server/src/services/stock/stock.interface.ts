export interface IStockRow {
  id: number;
  no: string;
  name: string;
  create_time: Date;
  update_time: Date;
}

export type TStockCreateBody = Pick<IStockRow, 'no'> & Partial<Omit<IStockRow, 'id' | 'no' | 'create_time' | 'update_time'>>;

export interface IStockService {
  getAll(): Promise<IStockRow[]>;
  create(body: TStockCreateBody): Promise<IStockRow>;
  update(id: string, body: TStockCreateBody): Promise<IStockRow>;
  remove(id: string): Promise<{ id: string }>;
  removes(body: { ids: string[] }): Promise<{ ids: string[] }>;
}