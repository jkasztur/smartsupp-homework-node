import * as koaBody from 'koa-body'
import * as Router from 'koa-router'
import { Context } from 'koa';
import { validate } from '../validator';
import * as Joi from '@hapi/joi'
import { AuthStorage } from '@src/app/authStorage';

/**
 * @injectable(http.routers.api)
 * @param authStorage @inject(app.authStorage)
 */
export function createRouter(authStorage: AuthStorage) {
	const router = new Router()
	router.use(koaBody())

	router.get('/api/test',validate({
		query: {
			token: Joi.string().required()
		}
	}), async (ctx: Context) => {
		if(await authStorage.isValidToken(ctx.query.token)) {
			ctx.body = 'Access granted!'
			return
		}
		ctx.status = 403
	})

	return router
}
