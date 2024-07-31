// FastifyRequestContext
import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    user?: {
      id: string
      name: string
      email: string
      password_hash: string
      created_at: Date
      session_id: string
    }
  }
}
