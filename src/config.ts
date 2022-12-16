const env = Deno.env.toObject();

export default {
    redis: {
        hostname: env.HOSTNAME,
        port: parseInt(env.PORT) | 6379 
    },
    tokens:{
        issuer: env.ISSUER,
        audience: env.AUDIENCE,
        protectedHeader: env.PROTECTED_HEADER,
        access: {
            secret: new TextEncoder().encode(env.ACCESS_SECRET),
            expirationTime: env.ACCESS_EXPIRATION
        },
        refresh: {
            secret: new TextEncoder().encode(env.REFRESH_SECRET),
            expirationTime: env.REFRESH_EXPIRATION
        }
    },
} as const;