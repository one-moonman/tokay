import { serve } from "https://deno.land/std/http/server.ts";
import { Hono } from "https://deno.land/x/hono/mod.ts";

import { connect } from "https://deno.land/x/redis/mod.ts";
import config from "./src/config.ts";

const redis = await connect(config.redis);

const app = new Hono();

// generate tokens
app.post("/", async (ctx) => {
  const { owner }: { owner: string } = await ctx.req.json();
  if (!owner) {
    ctx.status(400)
    return ctx.json({ message: "Owner not provided via request body", success: false});
  }
  // pass to token service
  // return tokens
});

// verify tokens
app.post("/", async (ctx) => {

});

// refresh
app.post("/", async (ctx) => {
});

// blacklist
app.delete("/", async (ctx) => {
});

serve(app.fetch, { port: 3000 });
