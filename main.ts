import { serve } from "https://deno.land/std/http/server.ts";
import { Hono } from "https://deno.land/x/hono/mod.ts";

import { connect } from "https://deno.land/x/redis/mod.ts";
import config from "./src/config.ts";
import Service from "./src/service.ts";
import Store from "./src/store.ts";
import { generatePair } from "./src/utilities.ts";

const app = new Hono();

const redis = await connect(config.redis);
const service = new Service();
const store = new Store(redis);

// generate tokens
app.post("/", async (ctx) => {
   const { owner }: { owner: string } = await ctx.req.json();
   if (!owner) {
      ctx.status(400);
      return ctx.json({
         message: "Owner not provided via request body",
         success: false,
      });
   }
   const pair = generatePair();
   const access = await service.GenerateToken({
      payload: { owner, pair },
      expirationTime: config.tokens.access.expirationTime,
      secret: config.tokens.access.secret,
   });

   const refresh = await service.GenerateToken({
      payload: { owner, pair },
      expirationTime: config.tokens.refresh.expirationTime,
      secret: config.tokens.refresh.secret,
   });

   const push = await store.PushToStore(
      owner + "_" + pair,
      refresh,
      config.tokens.refresh.expirationTime as any as number,
   );

   ctx.status(200);
   return ctx.json({ data: { access, refresh }, success: true });
});

// verify access tokens
app.post("/verify/access", async (ctx) => {
   const { token }: { token: string } = await ctx.req.json();
   if (!token) {
      ctx.status(400);
      return ctx.json({
         message: "Token not provided via request body",
         success: false,
      });
   }
   const verification = await service.VerifyToken(token, config.tokens.access.secret);
   if (await store.ExistsInBlackList(verification.payload["owner"] as string, token)) {
      ctx.status(401);
      return ctx.json({
         message: "Token is blacklisted",
         success: false,
      });
   }
   ctx.status(200);
   return ctx.json({ success: true, message: "", data: {} })
});

// verify refresh tokens
app.post("/verify/refresh", async (ctx) => {
   const { token }: { token: string } = await ctx.req.json();
   if (!token) {
      ctx.status(400);
      return ctx.json({
         message: "Token not provided via request body",
         success: false,
      });
   }
   const verification = await service.VerifyToken(token, config.tokens.refresh.secret);
   if (!await store.ExistsInStore(token)) {
      ctx.status(401);
      return ctx.json({
         message: "Token not in store",
         success: false,
      });
   }
   ctx.status(200);
   return ctx.json({ success: true, message: "", data: {} })
});

// refresh
app.post("/", async (ctx) => {
   const { token }: { token: string } = await ctx.req.json();
   if (!token) {
      ctx.status(400);
      return ctx.json({
         message: "Token not provided via request body",
         success: false,
      });
   }
   const verification = await service.VerifyToken(token, config.tokens.access.secret);
   //
   const blacklisted = await store.PushToBlackList(
      verification.payload["owner"] as string,
      verification.payload["pair"] as string,
      token
   );

   ctx.status(200);
});

// blacklist
app.delete("/", async (ctx) => {
   const { token }: { token: string } = await ctx.req.json();
   if (!token) {
      ctx.status(400);
      return ctx.json({
         message: "Token not provided via request body",
         success: false,
      });
   }
   const verification = await service.VerifyToken(token, config.tokens.access.secret);
   //
   const blacklisted = await store.PushToBlackList(
      verification.payload["owner"] as string,
      verification.payload["pair"] as string,
      token
   );

   ctx.status(200);
   return ctx.json({ success: true, message: "", data: {} })
});

serve(app.fetch, { port: 3000 });
