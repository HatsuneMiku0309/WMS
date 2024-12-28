import { PoolClient } from "pg";
import { IPgDb } from "../../db.interface";
import { IVendorRow, IStockService, TVendorCreateBody } from "./vendor.interface";
import { IProductRow } from "../product/product.interface";
import * as _ from 'lodash';

export class VendorService implements IStockService {
  private readonly _pgDb: IPgDb;
  constructor(pgDB: IPgDb) {
      this._pgDb = pgDB;
  }

  async getAll(): Promise<IVendorRow[]> {
    const conn = await this._pgDb.getPool().connect();
    try {
      const { rows } = await conn.query<IVendorRow>('SELECT * FROM vendors ORDER BY id');

      return rows;
    } finally {
      conn.release();
      }
  }

  async create(body: TVendorCreateBody): Promise<IVendorRow> {
    const conn = await this._pgDb.getPool().connect();
    try {
      const { fieldSql, valuesSql, values } = this._pgDb.grantInsertSql(body);
      const sql = `INSERT INTO vendors ${fieldSql} VALUES ${valuesSql} RETURNING id`;
      const { rows } = await conn.query<{ id: number }>(sql, values);
      const row = rows[0];
      const { rows: productRows } = await conn.query<IVendorRow>('SELECT * FROM vendors WHERE id = $1', [row.id]);
      const productRow = productRows[0];

      return productRow;
    } finally {
      conn.release();
    }
  }

  async update(id: string, body: TVendorCreateBody): Promise<IVendorRow> {
    const conn = await this._pgDb.getPool().connect();
    try {
      let { sets, setSql, nextIndex } = this._pgDb.grantUpdateSql(body);
      const sql = `UPDATE vendors SET ${setSql}, update_time = $${++nextIndex} WHERE id = $${++nextIndex} RETURNING id`;
      const { rows } = await conn.query<{ id: number }>(sql, [...sets, new Date(), id]);
      const row = rows[0];
      const { rows: productRows } = await conn.query<IVendorRow>('SELECT * FROM vendors WHERE id = $1', [row.id]);
      const productRow = productRows[0];

      return productRow;
    } finally {
      conn.release();
    }
  }

  private async _checkDependances(conn: PoolClient, ids: string[]) {
    const whereSql = ids.map((id, index) => `$${index + 1}`);
    const { rows } = await conn.query<IProductRow>(`select * from products where vendor_id in (${whereSql.join(', ')})`, ids);
    if (rows.length !== 0) {
     const depends = _.uniq(rows.map((row) => row.vendor_id));
     throw new Error(`[${depends}] id is dependent on products`);
    }
 }

  async remove(id: string) {
    await this.removes({ ids: [id] });

    return {
      id
    }
  }

  async removes(body: { ids: string[]; }) {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._checkDependances(conn, body.ids);
      const whereSql = body.ids.map((b, index) => `$${index + 1}`);
      await conn.query(`delete from vendors where id in (${whereSql.join(', ')}) RETURNING id`, body.ids);
      
      return body;
    } finally {
      conn.release();
    }
  }
}