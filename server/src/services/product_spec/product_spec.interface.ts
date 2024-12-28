import { IMediaRow } from "../media/media.interface";

export interface IProductSpecRow {
  id: number;
  product_id: number;
  no: string;
  name: string;
  count: number;
  stock_id: number;
  single_cost: number;
  create_time: Date;
  update_time: Date;
  media_id: number;
}

export interface IProductSpecWithMedia extends IProductSpecRow, Pick<IMediaRow, 'filepath' | 'new_filename' | 'mimetype'>{

}

export interface IProductSpecWithMediaRes extends IProductSpecRow, Pick<IMediaRow, 'mimetype'> {
  image_meta: string;
}

export type TProductSpecCreateBody = Pick<IProductSpecRow, 'no' | 'product_id' | 'stock_id'> & Partial<Omit<IProductSpecRow, 'id' | 'no' | 'product_id' | 'stock_id' | 'create_time' | 'update_time'>>;

export interface IProductSpecService {
  getAll(): Promise<IProductSpecWithMediaRes[]>;
  create(body: TProductSpecCreateBody): Promise<IProductSpecRow>;
  update(id: string, body: TProductSpecCreateBody): Promise<IProductSpecRow>;
  remove(id: string): Promise<{ id: string }>;
  removes(body: { ids: string[] }): Promise<{ ids: string[] }>;
}