import { prisma } from '@/lib/prisma'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkSessionIdExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = request.cookies.session_id

  if (!sessionId) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

  const user = await prisma.user.findFirst({
    where: {
      session_id: sessionId,
    },
  })

  if (!user) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

  request.user = user
}
