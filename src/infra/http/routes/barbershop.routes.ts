import { FastifyInstance } from "fastify";
import { getBarbersController } from "../controllers/barbershops/getBarbers.controller.js";

export async function barbershopRoutes(app: FastifyInstance) {
  app.get("/barbershops/:barbershopId/barbers", getBarbersController);
}
