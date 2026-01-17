import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import { appRoutes } from "./infra/http/routes/routes.js";
import { errorHandler } from "./infra/http/middlewares/error-handler.js";
import { env } from "./infra/env/env.js";

export const app = Fastify({
  logger: env.NODE_ENV === "production",
});

// Cookie support for secure session delivery
await app.register(fastifyCookie, {
  secret: env.JWT_SECRET, // Used for signed cookies
  hook: "onRequest",
});

// JWT authentication with cookie support
await app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: "session",
    signed: false, // Cookie value is the JWT itself
  },
});

app.setErrorHandler(errorHandler);

await appRoutes(app);
