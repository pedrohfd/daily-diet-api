import fastify from 'fastify'
import { usersRoutes } from './http/users.routes'
import fastifyCookie from '@fastify/cookie'
import { mealsRoutes } from './http/meals.routes'

export const app = fastify()

app.register(fastifyCookie)

app.register(usersRoutes, { prefix: 'users' })

app.register(mealsRoutes, { prefix: 'meals' })
