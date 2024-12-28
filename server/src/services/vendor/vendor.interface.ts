export interface IVendorRow {
  id: number;
  no: string;
  name: string;
  address: string;
  url: string;
  create_time: Date;
  update_time: Date;
}

export type TVendorCreateBody = Pick<IVendorRow, 'no'> & Partial<Omit<IVendorRow, 'id' | 'no' | 'create_time' | 'update_time'>>;

export interface IStockService {
  getAll(): Promise<IVendorRow[]>;
  create(body: TVendorCreateBody): Promise<IVendorRow>;
  update(id: string, body: TVendorCreateBody): Promise<IVendorRow>;
  remove(id: string): Promise<{ id: string }>;
  removes(body: { ids: string[] }): Promise<{ ids: string[] }>;
}