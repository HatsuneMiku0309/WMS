import * as Router from 'koa-router';
import { StockService } from './stock';
import { IPgDb } from '../../db.interface';
import { TStockCreateBody } from './stock.interface';
import { IMyRouterOptions } from '../utils.interface';
import { Utils } from '../utils';

export class StockRouter {
    private readonly _router: Router;
    private readonly _utils: Utils;
    constructor(pgDb: IPgDb, options: IMyRouterOptions) {
        this._router = new Router();
        this._utils = options.utils;
        this.registerAPIs(pgDb);
    }

    get router() {
        return this._router;
    }

    registerAPIs(pgDb: IPgDb) {
        const stock = new StockService(pgDb);
        this._utils.registController('stock', stock);
        this._router.get('/stocks', async (ctx) => {
            try {
                const data = await stock.getAll();

                ctx.body = {
                    data
                };
            } catch (err) {
              throw err;
            }
        });

        this._router.post('/stock', async (ctx) => {
            const body = <TStockCreateBody> ctx.request.body;
            try {
                const data = await stock.create(body);

                ctx.body = {
                    data
                };
            } catch (err) {
                throw err;
            }
        });

        this._router.put('/stock/:id', async (ctx) => {
            const id = ctx.params.id;
            const body = <TStockCreateBody> ctx.request.body;
            try {
                const data = await stock.update(id, body);

                ctx.body = {
                    data
                };
            } catch (err) {
                throw err;
            }
        });

        this._router.del('/stock/:id', async (ctx) => {
            const id = ctx.params.id;
            try {
                const data = await stock.remove(id);

                ctx.body = {
                    data
                }
            } catch (err) {
                throw err;
            }
        });

        this._router.del('/stocks', async (ctx) => {
            const body = <{ ids: string[] }> ctx.request.body;
            try {
                const data = await stock.removes(body);

                ctx.body = {
                    data
                }
            } catch (err) {
                throw err;
            }
        });


        return this._router;
    }
}
