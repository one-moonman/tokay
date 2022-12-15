import { connectRedis, Hono, serve } from "./deps.ts";

const redis = await connectRedis({
  hostname: "127.0.0.1",
  port: 6379,
});

const app = new Hono();

// generate tokens
app.post('/', async (ctx) => {

})

// verify tokens
app.post('/', async (ctx) => {

})

// refresh
app.post('/', async (ctx) => {

})

// blacklist
app.delete('/', async (ctx) => {

})

serve(app.fetch);

