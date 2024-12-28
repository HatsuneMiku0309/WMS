import * as Router from 'koa-router';
import { VendorService } from './vendor';
import { IPgDb } from '../../db.interface';
import { TVendorCreateBody } from './vendor.interface';
import { IMyRouterOptions } from '../utils.interface';
import { Utils } from '../utils';

export class VendorRouter {
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
        const vendor = new VendorService(pgDb);
        this._utils.registController('vendor', vendor);
        this._router.get('/vendors', async (ctx) => {
            try {
                const datas = await vendor.getAll();

                ctx.body = {
                    data: datas
                };
            } catch (err) {
              throw err;
            }
        });

        this._router.post('/vendor', async (ctx) => {
            const body = <TVendorCreateBody> ctx.request.body;
            try {
                const datas = await vendor.create(body);

                ctx.body = {
                    data: datas
                };
            } catch (err) {
                throw err;
            }
        });

        this._router.put('/vendor/:id', async (ctx) => {
            const id = ctx.params.id;
            const body = <TVendorCreateBody> ctx.request.body;
            try {
                const datas = await vendor.update(id, body);

                ctx.body = {
                    data: datas
                };
            } catch (err) {
                throw err;
            }
        });

        this._router.del('/vendor/:id', async (ctx) => {
            const id = ctx.params.id;
            try {
                const data = await vendor.remove(id);

                ctx.body = {
                    data
                }
            } catch (err) {
                throw err;
            }
        });

        this._router.del('/vendors', async (ctx) => {
            const body = <{ ids: string[] }> ctx.request.body;
            try {
                const data = await vendor.removes(body);

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
