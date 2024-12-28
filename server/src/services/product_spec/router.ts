import * as Router from 'koa-router';
import { ProductSpecService } from './product_spec';
import { IPgDb } from '../../db.interface';
import { TProductSpecCreateBody } from './product_spec.interface';
import { IMyRouterOptions } from '../utils.interface';
import { Utils } from '../utils';

export class ProductSpecRouter {
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
        const productSpec = new ProductSpecService(pgDb, this._utils);
        this._utils.registController('productSpec', productSpec);
        this._router.get('/product_specs', async (ctx) => {
            try {
                const data = await productSpec.getAll();

                ctx.body = {
                    data
                };
            } catch (err) {
              throw err;
            }
        });

        this._router.post('/product_spec', async (ctx) => {
            const body = <TProductSpecCreateBody> ctx.request.body;
            try {
                const data = await productSpec.create(body);

                ctx.body = {
                    data
                };
            } catch (err) {
                throw err;
            }
        });

        this._router.put('/product_spec/:id', async (ctx) => {
            const id = ctx.params.id;
            const body = <TProductSpecCreateBody> ctx.request.body;
            try {
                const data = await productSpec.update(id, body);

                ctx.body = {
                    data
                };
            } catch (err) {
                throw err;
            }
        });

        this._router.del('/product_spec/:id', async (ctx) => {
            const id = ctx.params.id;
            try {
                const data = await productSpec.remove(id);

                ctx.body = {
                    data
                };
            } catch (err) {
                throw err;
            }
        });

        this._router.del('/product_specs', async (ctx) => {
            const body = <{ ids: string[] }> ctx.request.body;
            try {
                const data = await productSpec.removes(body);

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
