import { Container } from 'node-injectable'
import { createClient, createContainer, startServer, stopServer } from '../support/helpers'
import { AxiosInstance } from 'axios'

describe('client', () => {
    let container: Container
    let client: AxiosInstance
    const secret: string = '1234'
    const redirectUri: string = 'google.com'

    beforeAll(async () => {
        container = await createContainer()
        client = createClient()
        await startServer(container)
    })

    test('should not add client without secret', async () => {
        const res = await client.post('/clients/1')
        expect(res.status).toBe(400)
    })

    test('should not add client without redirectUri', async () => {
        const res = await client.post('/clients/1', { secret: secret })
        expect(res.status).toBe(400)
    })

    test('should add client with both params', async () => {
        const res = await client.post('/clients/1', { secret: secret, redirectUri: redirectUri })
        expect(res.status).toBe(200)
    })

    test('should get added client', async () => {
        const res = await client.get('/clients/1')
        expect(res.status).toBe(200)
        expect(res.data['secret']).toBe(secret);
        expect(res.data['redirectUri']).toBe(redirectUri);
    })

    test('should overwrite client', async () => {
        const res = await client.post('/clients/1', { secret: '5678', redirectUri: 'bing.com' })
        expect(res.status).toBe(200)
    })

    test('should get new client', async () => {
        const res = await client.get('/clients/1')
        expect(res.status).toBe(200)
        expect(res.data['secret']).toBe('5678');
        expect(res.data['redirectUri']).toBe('bing.com');
    })
    
    test('should delete client', async() => {
        const res = await client.delete('/clients/1')
        expect(res.status).toBe(200)
    })

    test('should not return anything', async () => {
        const res = await client.get('/clients/1')
        expect(res.status).toBe(404)
    })

    afterAll(async () => {
        await stopServer(container)
    })
})
