import * as jose from "https://deno.land/x/jose/index.ts";
import { Redis } from "https://deno.land/x/redis/mod.ts";
import config from "./config.ts";

interface ITokenArgs {
  payload: jose.JWTPayload & { owner: string; pair: string };
  expirationTime: string | number;
  secret: Uint8Array;
}

export class TokenService {
  public async GenerateToken(args: ITokenArgs) {
    return new jose.SignJWT(args.payload)
      .setProtectedHeader({ alg: config.tokens.protectedHeader })
      .setIssuedAt()
      .setIssuer(config.tokens.issuer)
      .setAudience(config.tokens.audience)
      .setExpirationTime(args.expirationTime)
      .sign(args.secret);
  }

  public async VerifyToken(token: string, secret: Uint8Array) {
    return jose.jwtVerify(token, secret, {
      issuer: config.tokens.issuer,
      audience: config.tokens.audience,
    });
  }
}

export class TokenStore {
  constructor(private readonly store: Redis) {}

  public async ExistsInStore(key: string) {
    return this.store.get(key);
  }

  public async ExistsInBlackList(owner: string, token: string) {
    return this.store.sismember("BL_" + owner, token);
  }

  public async PushToStore(key: string, value: string, expirationTime: number) {
    return this.store.set(key, value, { px: expirationTime });
  }

  public async PushToBlackList(owner: string, pairId: string, token: string) {
    Promise.all([
      this.store.del(owner + "_" + pairId),
      this.store.sadd("BL_" + owner, token),
    ]);
  }
}
