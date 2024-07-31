import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const registerBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(6),
    })

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.setCookie('session_id', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    const { name, email, password } = registerBodySchema.parse(request.body)

    const userByEmail = await prisma.user.findFirst({
      where: {
        email,
      },
    })

    if (userByEmail) {
      return reply.status(409).send({ message: 'User already exists' })
    }

    const password_hash = await hash(password, 6)

    try {
      await prisma.user.create({
        data: {
          name,
          email,
          password_hash,
          session_id: sessionId,
        },
      })
    } catch (error) {
      return reply.status(409).send()
    }

    return reply.status(201).send()
  })
}
