import * as koaBody from 'koa-body'
import * as Router from 'koa-router'
import { Context } from 'koa';
import { validate } from '../validator';
import * as Joi from '@hapi/joi'
import { ClientStorage } from '@src/app/clientStorage';
import { AuthStorage } from '@src/app/authStorage';

/**
 * @injectable(http.routers.oauth)
 * @param clientStorage @inject(app.clientStorage)
 * @param authStorage @inject(app.authStorage)
 */
export function createRouter(clientStorage: ClientStorage, authStorage: AuthStorage) {
	const router = new Router()
	router.use(koaBody())

	// TODO: implement(done)
	router.get('/oauth/authorize', validate({
		query: {
			id: Joi.string().required(),
			//redirectUri is mandatory, but not used here
			redirectUri: Joi.string().required(),
			state: Joi.string().required()
		}
	}), async (ctx: Context) => {
		const { id, state } = ctx.query;
		const client = await clientStorage.getClient(id)
		if (!client) {
			ctx.status = 404
			return
		}

		const authCode = `code-${randomString()}`
		authStorage.addAuthKey(authCode, id)
		ctx.body = { authCode, state }
	})

	// TODO: implement(done)
	router.get('/oauth/token', validate({
		query: {
			code: Joi.string().required(),
			id: Joi.string().required(),
			secret: Joi.string().required()
		}
	}), async (ctx: Context) => {
		const { id, code, secret } = ctx.query;
		const client = await clientStorage.getClient(id)
		if (!client) {
			ctx.status = 404
			return
		}

		const retClient = await authStorage.getUserByKey(code)
		if (client.secret !== secret || retClient !== id) {
			ctx.status = 403
			return
		}
		const token = `token-${randomString()}`
		authStorage.addToken(token)
		ctx.body = { token }
	})

	return router
}

export function randomString(): string {
	return Math.random().toString(36).substring(2, 15)
}
