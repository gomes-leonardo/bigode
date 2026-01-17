import { FastifyInstance } from "fastify";
import { getAvailabilityController } from "../controllers/scheduling/getAvailability/availability.controller.js";
import { createAppointmentController } from "../controllers/scheduling/createAppointment/createAppointment.controller.js";

export async function schedulingRoutes(app: FastifyInstance) {
  app.get("/availability", getAvailabilityController);
  app.post("/appointments", createAppointmentController);
}
