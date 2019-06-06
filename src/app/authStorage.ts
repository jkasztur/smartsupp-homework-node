import Redis = require('ioredis')

export class AuthStorage {

	/**
	 * @injectable(app.authStorage)
	 * @param redis @inject(redis)
	 */
    constructor(
        private redis: Redis.Redis,
    ) {
    }

    async addAuthKey(key: string, user: string): Promise<any> {
        await this.redis.set(key, user)
    }

    async addToken(token: string): Promise<any> {
        await this.redis.sadd('tokens', token)
    }

    async isValidToken(token: string): Promise<boolean> {
        const res = await this.redis.sismember('tokens', token)
        return res ? true : false
    }
    async getUserByKey(key: string): Promise<any> {
        const res = await this.redis.get(key)

        return res
    }
}
