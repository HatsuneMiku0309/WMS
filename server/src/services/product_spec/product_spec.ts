import { PoolClient } from "pg";
import { IPgDb } from "../../db.interface";
import { IProductSpecRow, IProductSpecService, TProductSpecCreateBody, IProductSpecWithMedia, IProductSpecWithMediaRes } from "./product_spec.interface";
import * as fs from 'fs';
import * as path from 'path';
import { Utils } from "../utils";
import { IMediaService } from "../media/media.interface";

export class ProductSpecService implements IProductSpecService {
  private readonly _pgDb: IPgDb;
  private readonly _utils: Utils;
  constructor(pgDB: IPgDb, utils: Utils) {
      this._pgDb = pgDB;
      this._utils = utils;
  }

  async getAll(): Promise<IProductSpecWithMediaRes[]> {
    const conn = await this._pgDb.getPool().connect();
    try {
      const sql = `
      select
        ps.*,
        m.filepath,
        m.new_filename,
        m.mimetype 
      from
        product_specs ps
        left join media m on m.id = ps.media_id
      order by
        ps.id
      `;
      const { rows } = await conn.query<IProductSpecWithMedia>(sql);
      const datas = rows.map((row) => {
        const result = {
          id: row.id,
          product_id: row.product_id,
          no: row.no,
          name: row.name,
          count: row.count,
          stock_id: row.stock_id,
          single_cost: row.single_cost,
          create_time: row.create_time,
          update_time: row.update_time,
          media_id: row.media_id,
          mimetype: row.mimetype,
          image_meta : ''
        };
        if (row.filepath && row.new_filename) {
          const readFile = fs.readFileSync(path.join(row.filepath, row.new_filename)).toString('base64');
          result.image_meta = readFile;
        }

        return result;
      });

      return datas;
    } finally {
      conn.release();
    }
  }

  private async _checkArgs(conn: PoolClient, body: TProductSpecCreateBody) {
    await this._checkProduct(conn, body.product_id);
    await this._checkStock(conn, body.stock_id);
    await this
  }

  private async _checkProduct(conn: PoolClient, product_id: number) {
    const { rows } = await conn.query('SELECT * FROM products WHERE id = $1', [product_id]);
    if (rows.length !== 1) {
      throw new Error('[product_id] not find');
    }
  }

  private async _checkStock(conn: PoolClient, stock_id: number) {
    const { rows } = await conn.query('SELECT * FROM stocks WHERE id = $1', [stock_id]);
    if (rows.length !== 1) {
      throw new Error('[stock_id] not find');
    }
  }

  async create(body: TProductSpecCreateBody): Promise<IProductSpecRow> {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._checkArgs(conn, body);
      const { rows: productRows } = await conn.query('select * from products where id = $1', [body.product_id]);
      if (productRows.length === 0) {
        throw new Error(`[body.product_id] id not found in products`);
      }
      const { fieldSql, valuesSql, values } = this._pgDb.grantInsertSql(body);
      const sql = `INSERT INTO product_specs ${fieldSql} VALUES ${valuesSql} RETURNING id`;
      const { rows } = await conn.query<{ id: number }>(sql, values);
      const row = rows[0];
      const { rows: productSpecRows } = await conn.query<IProductSpecRow>('SELECT * FROM product_specs WHERE id = $1', [row.id]);
      const productSpecRow = productSpecRows[0];

      return productSpecRow;
    } finally {
      conn.release();
    }
  }

  async update(id: string, body: TProductSpecCreateBody): Promise<IProductSpecRow> {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._checkArgs(conn, body);
      let { sets, setSql, nextIndex } = this._pgDb.grantUpdateSql(body);
      const sql = `UPDATE product_specs SET ${setSql}, update_time = $${++nextIndex} WHERE id = $${++nextIndex} RETURNING id`;
      const { rows } = await conn.query<{ id: number }>(sql, [...sets, new Date(), id]);
      const row = rows[0];
      const { rows: productSpecRows } = await conn.query<IProductSpecRow>('SELECT * FROM product_specs WHERE id = $1', [row.id]);
      const productSpecRow = productSpecRows[0];

      return productSpecRow;
    } finally {
      conn.release();
    }
  }

  private async _removeDepends(conn:PoolClient, ids: string[]) {
    const media = <IMediaService> this._utils.get('media');
    await media.dbRemoveFilesByIds(conn, { ids: ids });
  }

  async remove(id: string) {
    await this.removes({ ids: [id] });

    return { id };
  }

  async removes(body: { ids: string[] }) {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._pgDb.setTransaction(conn);
      const whereSql = body.ids.map((b, index) => `$${index + 1}`);
      const { rows } = await conn.query(`select * from product_specs WHERE id in (${whereSql.join(', ')})`, body.ids);
      if (rows.length === 0) {
        throw new Error(`[${body.ids}] Already Deleted`);
      }
      const media_ids = rows.map((row) => row.media_id);
      await this._removeDepends(conn, media_ids);
      const sql = `DELETE FROM product_specs WHERE id in (${whereSql.join(', ')}) RETURNING id`;
      await conn.query(sql, body.ids);
      await this._pgDb.setCommit(conn);

      return body;
    } catch (err) {
      await this._pgDb.setRollback(conn);
      throw err;
    } finally {
      conn.release();
    }
  }

}