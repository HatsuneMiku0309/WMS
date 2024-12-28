export interface IProductRow {
  id: number;
  no: string;
  name: string;
  vendor_id: number;
  dropshipping: string;
  express_fee: number;
  dropshipping_url: string;
  create_time: Date;
  update_time: Date;
  image_path: string;
}

export type TProductCreateBody = Pick<IProductRow, 'no' | 'vendor_id' | 'dropshipping'> & Partial<Omit<IProductRow, 'id' | 'no' | 'vendor_id' | 'create_time' | 'update_time'>>;

export interface IProductService {
  getAll(): Promise<IProductRow[]>;
  create(body: TProductCreateBody): Promise<IProductRow>;
  update(id: string, body: TProductCreateBody): Promise<IProductRow>;
  remove(id: string): Promise<{ id: string }>;
  removes(body: { ids: string[] }): Promise<{ ids: string[] }>;
}