import { app } from '@/app'
import { afterAll, beforeAll, describe, it } from 'vitest'
import request from 'supertest'

describe('users routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should create a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'johndoe@exemple.com',
        password: '123456',
      })
      .expect(201)
  })
})
