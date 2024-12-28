import { PoolClient } from "pg";
import { IPgDb } from "../../db.interface";
import { IProductRow, IProductService, TProductCreateBody } from "./product.interface";
import * as _ from 'lodash';

export class ProductService implements IProductService {
  private readonly _pgDb: IPgDb;
  constructor(pgDB: IPgDb) {
      this._pgDb = pgDB;
  }

  async getAll(): Promise<IProductRow[]> {
    const conn = await this._pgDb.getPool().connect();
    try {
      const { rows } = await conn.query<IProductRow>('SELECT * FROM products ORDER BY id');

      return rows;
    } finally {
      conn.release();
      }
  }

  private async _checkArgs(conn: PoolClient, body: TProductCreateBody) {
    await this._checkVendor(conn, body.vendor_id);
    if (!['Y', 'N'].includes(body.dropshipping)) {
      throw new Error('[dropshipping] is wrong args, must is include [Y,N]');
    }
    if (body.dropshipping === 'Y' && (body.dropshipping_url === undefined || body.dropshipping_url.trim() === '')) {
      throw new Error('[dropshipping] is "Y", require [dropshipping_url]');
    }
    if (body.express_fee! < 0) {
      throw new Error('[express_fee] can\'t less 0');
    }
  }

  private async _checkVendor(conn: PoolClient, vendor_id: number) {
    const { rows } = await conn.query('SELECT * FROM vendors WHERE id = $1', [vendor_id]);
    if (rows.length !== 1) {
      throw new Error('[vendor_id] not find');
    }
  }

  async create(body: TProductCreateBody): Promise<IProductRow> {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._checkArgs(conn, body);
      const { fieldSql, valuesSql, values } = this._pgDb.grantInsertSql(body);
      const sql = `INSERT INTO products ${fieldSql} VALUES ${valuesSql} RETURNING id`;
      const { rows } = await conn.query<{ id: number }>(sql, values);
      const row = rows[0];
      const { rows: productRows } = await conn.query<IProductRow>('SELECT * FROM products WHERE id = $1', [row.id]);
      const productRow = productRows[0];

      return productRow;
    } finally {
      conn.release();
    }
  }

  async update(id: string, body: TProductCreateBody): Promise<IProductRow> {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._checkArgs(conn, body);
      let { sets, setSql, nextIndex } = this._pgDb.grantUpdateSql(body);
      const sql = `UPDATE products SET ${setSql}, update_time = $${++nextIndex} WHERE id = $${++nextIndex} RETURNING id`;
      const { rows } = await conn.query<{ id: number }>(sql, [...sets, new Date(), id]);
      const row = rows[0];
      const { rows: productRows } = await conn.query<IProductRow>('SELECT * FROM products WHERE id = $1', [row.id]);
      const productRow = productRows[0];

      return productRow;
    } finally {
      conn.release();
    }
  }

  private async _checkDependances(conn: PoolClient, ids: string[]) {
    const whereSql = ids.map((id, index) => `$${index + 1}`);
    const productSpecsSql = `SELECT product_id FROM product_specs WHERE product_id in (${whereSql.join(', ')})`;
    const { rows } = await conn.query(productSpecsSql, ids);
    if (rows.length !== 0) {
      const depends = _.uniq(rows.map((row) => row.product_id));
      throw new Error(`[${depends}] id is dependent on product_specs`);
    }
  }

  async remove(id: string) {
    await this.removes({ ids: [id] });

    return { id };
  }

  async removes(body: { ids: string[] }) {
    const conn = await this._pgDb.getPool().connect();
    try {
      await this._checkDependances(conn, body.ids);
      const whereSql = body.ids.map((b, index) => `$${index + 1}`);
      const sql = `DELETE FROM products WHERE id in (${whereSql.join(', ')}) RETURNING id`;
      await conn.query(sql, body.ids);

      return body;
    } finally {
      conn.release();
    }
  }

}