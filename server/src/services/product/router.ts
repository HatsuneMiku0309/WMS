import * as Router from 'koa-router';
import { ProductService } from './product';
import { IPgDb } from '../../db.interface';
import { TProductCreateBody } from './product.interface';
import { IMyRouterOptions } from '../utils.interface';
import { Utils } from '../utils';

export class ProductRouter {
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
        const product = new ProductService(pgDb);
        this._utils.registController('product', product);
        this._router.get('/products', async (ctx) => {
            try {
                const data = await product.getAll();

                ctx.body = {
                    data
                };
            } catch (err) {
              throw err;
            }
        });

        this._router.post('/product', async (ctx) => {
            const body = <TProductCreateBody> ctx.request.body;
            try {
                const data = await product.create(body);

                ctx.body = {
                    data
                };
            } catch (err) {
                throw err;
            }
        });

        this._router.put('/product/:id', async (ctx) => {
            const id = ctx.params.id;
            const body = <TProductCreateBody> ctx.request.body;
            try {
                const data = await product.update(id, body);

                ctx.body = {
                    data
                };
            } catch (err) {
                throw err;
            }
        });

        this._router.del('/product/:id', async (ctx) => {
            const id = ctx.params.id;
            try {
                const data = await product.remove(id);

                ctx.body = {
                    data
                };
            } catch (err) {
                throw err;
            }
        });

        this._router.del('/products', async (ctx) => {
            const body = <{ ids: string[] }> ctx.request.body;
            try {
                const data = await product.removes(body);

                ctx.body = {
                    data
                };
            } catch (err) {
                throw err;
            }
        });

        return this._router;
    }
}
