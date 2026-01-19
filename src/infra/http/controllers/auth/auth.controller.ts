import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function generateClientLinkController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    customerPhone: z.string(),
    barberId: z.string().uuid(),
    barbershopId: z.string().uuid(),
  });

  const validationResult = bodySchema.safeParse(req.body);

  if (!validationResult.success) {
    return reply.status(400).send({
      message: "Validation error",
      errors: validationResult.error.format(),
    });
  }

  const { customerPhone, barberId, barbershopId } = validationResult.data;

  try {
    const token = req.server.jwt.sign(
      {
        sub: customerPhone,
        role: "CLIENT",
        barbershopId,
      },
      {
        expiresIn: "1h",
      },
    );

    const link = `http://localhost:3000/booking?token=${token}&barberId=${barberId}`;

    return reply.status(201).send({ link });
  } catch (error) {
    throw error; // Deixa o error handler tratar
  }
}
