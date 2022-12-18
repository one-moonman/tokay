import * as jose from "https://deno.land/x/jose/index.ts";
import config from "./config.ts";

interface ITokenArgs {
  payload: jose.JWTPayload & { owner: string; pair: string };
  expirationTime: string | number;
  secret: Uint8Array;
}

export default class Service {
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
