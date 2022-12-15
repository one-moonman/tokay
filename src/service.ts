import {jose} from '../deps.ts';
const env = Deno.env.toObject()

export class TokenService{
    private secret =  new TextEncoder().encode(env.SECRET)

    constructor(){}

    private async generateToken(payload: jose.JWTPayload){
        return new jose.SignJWT(payload)
            .setProtectedHeader({ alg: env.ALG })
            .setIssuedAt()
            .setIssuer('tokay:issuer')
            .setAudience('tokay:audience')
            .setExpirationTime('2h')
            .sign(this.secret)
    }

    public async GenerateTokens(){
        // sign tokens
    }

    public async BlackListToken(){
    }

    public async VerifyToken(){

    }
}
