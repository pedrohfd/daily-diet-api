import { prisma } from '@/lib/prisma'
import { checkSessionIdExists } from '@/middlewares/check-session-id-exists'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.coerce.date(),
        time: z.string(),
        is_on_diet: z.boolean(),
      })

      const user_id = z.string().uuid().parse(request.user?.id)

      const { name, description, date, time, is_on_diet } =
        createMealBodySchema.parse(request.body)

      try {
        await prisma.meal.create({
          data: {
            name,
            description,
            date,
            time,
            is_on_diet,
            user_id,
          },
        })
      } catch (error) {
        return reply.status(400).send()
      }

      return reply.status(201).send()
    },
  )

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const user_id = z.string().uuid().parse(request.user?.id)

      const meals = await prisma.meal.findMany({
        where: {
          user_id,
        },
      })

      if (!meals) {
        return reply.status(404).send()
      }

      return reply.status(200).send({ meals })
    },
  )

  app.get(
    '/:mealId',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealByIdSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = getMealByIdSchema.parse(request.params)

      const user_id = z.string().uuid().parse(request.user?.id)

      const meal = await prisma.meal.findUnique({
        where: {
          id: mealId,
          user_id,
        },
      })

      if (!meal) {
        return reply.status(404).send()
      }

      return reply.status(200).send({ meal })
    },
  )

  app.delete(
    '/:mealId',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const deleteMealByIdSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = deleteMealByIdSchema.parse(request.params)

      const user_id = z.string().uuid().parse(request.user?.id)

      try {
        await prisma.meal.delete({
          where: {
            id: mealId,
            user_id,
          },
        })
      } catch (error) {
        return reply.status(400).send()
      }
    },
  )

  app.put(
    '/',
    {
      preHandler: [checkSessionIdExists],
      schema: { querystring: { mealId: { type: 'string' } } },
    },
    async (request, reply) => {
      const updateMealSchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.coerce.date(),
        time: z.string(),
        is_on_diet: z.boolean(),
      })

      const requestQuerySchema = z.object({
        mealId: z.string().uuid(),
      })

      const { name, description, date, time, is_on_diet } =
        updateMealSchema.parse(request.body)

      const { mealId } = requestQuerySchema.parse(request.query)

      const user_id = z.string().uuid().parse(request.user?.id)

      try {
        await prisma.meal.update({
          where: {
            id: mealId,
            user_id,
          },
          data: {
            name,
            description,
            date,
            time,
            is_on_diet,
          },
        })
      } catch (error) {
        return reply.status(400).send()
      }

      reply.status(200).send()
    },
  )

  app.get(
    '/metrics',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const user_id = z.string().uuid().parse(request.user?.id)

      const totalMealRegistered = await prisma.meal.findMany({
        where: {
          user_id,
        },
        orderBy: {
          created_at: 'desc',
        },
      })

      const totalMealOnDiet = await prisma.meal.count({
        where: {
          user_id,
          is_on_diet: true,
        },
      })

      const totalMealNotOnDiet = await prisma.meal.count({
        where: {
          user_id,
          is_on_diet: false,
        },
      })

      const bestSequenceOnDiet = totalMealRegistered.reduce(
        (acc, meal) => {
          if (meal.is_on_diet) {
            acc.currentSequence += 1
          } else {
            acc.currentSequence = 0
          }

          if (acc.currentSequence > acc.bestOnDietSequence) {
            acc.bestOnDietSequence = acc.currentSequence
          }

          return acc
        },
        { bestOnDietSequence: 0, currentSequence: 0 },
      )

      return reply.status(200).send({
        metrics: {
          totalMealRegistered: totalMealRegistered.length,
          totalMealOnDiet,
          totalMealNotOnDiet,
          bestSequenceOnDiet: bestSequenceOnDiet.bestOnDietSequence,
        },
      })
    },
  )
}
