import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import fastifyFormbody from "@fastify/formbody";
import { appRoutes } from "./infra/http/routes/routes.js";
import { errorHandler } from "./infra/http/middlewares/error-handler.js";
import { env } from "./infra/env/env.js";

// Extend FastifyRequest to include rawBody
declare module "fastify" {
  interface FastifyRequest {
    rawBody?: Buffer;
  }
}

export const app = Fastify({
  logger: env.NODE_ENV === "production",
});

// Capture raw body for Stripe webhook signature verification
app.addContentTypeParser(
  "application/json",
  { parseAs: "buffer" },
  (req, body, done) => {
    // Store raw body for Stripe webhooks
    if (req.url?.includes("/webhook/stripe")) {
      req.rawBody = body as Buffer;
    }

    try {
      const json = JSON.parse(body.toString());
      done(null, json);
    } catch (err) {
      done(err as Error, undefined);
    }
  },
);

// Form body support for Twilio webhooks (form-urlencoded)
await app.register(fastifyFormbody);

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
