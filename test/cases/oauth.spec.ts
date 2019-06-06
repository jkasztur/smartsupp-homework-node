import { Container } from 'node-injectable'
import { createClient, createContainer, startServer, stopServer } from '../support/helpers'
import { AxiosInstance } from 'axios'
import { randomString } from '@src/http/routers/oauth';

describe('oauth', () => {
    let container: Container
    let client: AxiosInstance
    const id: number = 1
    const secret: string = '1234'
    const redirectUri: string = 'google.com'
    const stateStr: string = randomString()
    let authCode: string

    beforeAll(async () => {
        container = await createContainer()
        client = createClient()
        await startServer(container)
        await client.post(`/clients/${id}`, { secret: secret, redirectUri: redirectUri })
    })

    test('client is prepared', async () => {
        const res = await client.get(`/clients/${id}`)
        expect(res.status).toBe(200)
    })

    test('should not auth without id', async () => {
        const res = await client.get(`/oauth/authorize?redirectUri=${redirectUri}&state=${stateStr}`)
        expect(res.status).toBe(400)
    })

    test('should not auth without redirectUri', async () => {
        const res = await client.get(`/oauth/authorize?id=${id}&state=${stateStr}`)
        expect(res.status).toBe(400)
    })

    test('should not auth without state', async () => {
        const res = await client.get(`/oauth/authorize?id=${id}&redirectUri=${redirectUri}`)
        expect(res.status).toBe(400)
    })

    test('should auth with full query', async () => {
        const res = await client.get(`/oauth/authorize?id=${id}&redirectUri=${redirectUri}&state=${stateStr}`)
        expect(res.status).toBe(200)
        authCode = res.data.authCode
        expect(res.data.state).toBe(stateStr)
    })

    test('should not give token with wrong id', async () => {
        const res = await client.get(`/oauth/token?id=666&secret=${secret}&code=${authCode}`)
        expect(res.status).toBe(404)
    })

    test('should not give token with wrong secret', async () => {
        const res = await client.get(`/oauth/token?id=${id}&secret=9577&code=${authCode}`)
        expect(res.status).toBe(403)
    })

    test('should not give token with wrong auth code', async () => {
        const res = await client.get(`/oauth/token?id=${id}&secret=${secret}&code=nope`)
        expect(res.status).toBe(403)
    })

    test('should give token with correct values', async () => {
        const res = await client.get(`/oauth/token?id=${id}&secret=${secret}&code=${authCode}`)
        expect(res.status).toBe(200)
        expect(res.data.token.startsWith('token')).toBeTruthy()
    })

    afterAll(async () => {
        await stopServer(container)
    })
})
