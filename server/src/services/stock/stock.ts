import { PoolClient } from "pg";
import { IPgDb } from "../../db.interface";
import { IStockRow, IStockService, TStockCreateBody } from "./stock.interface";
import { IProductSpecRow } from "../product_spec/product_spec.interface";
import * as _ from 'lodash';

export class StockService implements IStockService {
  private readonly _pgDb: IPgDb;
  constructor(pgDB: IPgDb) {
      this._pgDb = pgDB;
  }

  async getAll(): Promise<IStockRow[]> {
    const conn = await this._pgDb.getPool().connect();
    try {
      const { rows } = await conn.query<IStockRow>('SELECT * FROM stocks ORDER BY id');

      return rows;
    } finally {
      conn.release();
      }
  }

  async create(body: TStockCreateBody): Promise<IStockRow> {
    const conn = await this._pgDb.getPool().connect();
    try {
      const { fieldSql, valuesSql, values } = this._pgDb.grantInsertSql(body);
      const sql = `INSERT INTO stocks ${fieldSql} VALUES ${valuesSql} RETURNING id`;
      const { rows } = await conn.query<{ id: number }>(sql, values);
      const row = rows[0];
      const { rows: productRows } = await conn.query<IStockRow>('SELECT * FROM stocks WHERE id = $1', [row.id]);
      const productRow = productRows[0];

      return productRow;
    } finally {
      conn.release();
    }
  }

  async update(id: string, body: TStockCreateBody): Promise<IStockRow> {
    const conn = await this._pgDb.getPool().connect();
    try {
      let { sets, setSql, nextIndex } = this._pgDb.grantUpdateSql(body);
      const sql = `UPDATE stocks SET ${setSql}, update_time = $${++nextIndex} WHERE id = $${++nextIndex} RETURNING id`;
      const { rows } = await conn.query<{ id: number }>(sql, [...sets, new Date(), id]);
      const row = rows[0];
      const { rows: productRows } = await conn.query<IStockRow>('SELECT * FROM stocks WHERE id = $1', [row.id]);
      const productRow = productRows[0];

      return productRow;
    } finally {
      conn.release();
    }
  }

  private async _checkDependances(conn: PoolClient, ids: string[]) {
    const whereSql = ids.map((id, index) => `$${index + 1}`);
     const { rows } = await conn.query<IProductSpecRow>(`select * from product_specs where stock_id in (${whereSql.join(', ')})`, ids);
     if (rows.length !== 0) {
      const depends = _.uniq(rows.map((row) => row.stock_id));
      throw new Error(`[${depends}] id is dependent on product_specs`);
     }
  }

  async remove(id: string) {
    await this.removes({ ids: [id] });

    return { id };
  }

  async removes(body: { ids: string[]; }) {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._checkDependances(conn, body.ids);
      const whereSql = body.ids.map((b, index) => `$${index + 1}`);
      await conn.query(`delete from stocks where id in (${whereSql.join(', ')}) RETURNING id`, body.ids);

      return body;
    } finally {
      conn.release();
    }
  }

}