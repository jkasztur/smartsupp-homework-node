import { Container } from 'node-injectable'
import { createClient, createContainer, startServer, stopServer } from '../support/helpers'
import { AxiosInstance } from 'axios'
import { randomString } from '@src/http/routers/oauth';

describe('api', () => {
    let container: Container
    let client: AxiosInstance
    let token

    beforeAll(async () => {
        container = await createContainer()
        client = createClient()
        await startServer(container)
        await client.post('/clients/1', { secret: '1234', redirectUri: 'google.com' })
        let authCode
        await client.get(`/oauth/authorize?id=1&redirectUri=google.com&state=hello`).then((res) => {
            authCode = res.data['authCode']
        })

        await client.get(`/oauth/token?id=1&secret=1234&code=${authCode}`).then((res) => {
            token = res.data['token']
        })
    })

    test('token is prepared', () => {
        expect(token).toBeTruthy()
    })

    test('cant access api without token', async () => {
        const res = await client.get('/api/test')
        expect(res.status).toBe(400)
    })
    test('cant access api with wrong token', async () => {
        const res = await client.get('/api/test?token=veryWrong')
        expect(res.status).toBe(403)

    })
    test('can access api with correct token', async () => {
        const res = await client.get(`/api/test?token=${token}`)
        expect(res.status).toBe(200)
        expect(res.data).toBe('Access granted!')
    })



    afterAll(async () => {
        await stopServer(container)
    })

})
