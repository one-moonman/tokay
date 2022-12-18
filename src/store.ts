import { Redis } from "https://deno.land/x/redis/mod.ts";

export default class TokenStore {
    constructor(private readonly connection: Redis) { }

    public async ExistsInStore(key: string) {
        return this.connection.get(key);
    }

    public async ExistsInBlackList(owner: string, token: string) {
        return this.connection.sismember("BL_" + owner, token);
    }

    public async PushToStore(key: string, value: string, expirationTime: number) {
        return this.connection.set(key, value, { px: expirationTime });
    }

    public async PushToBlackList(owner: string, pair: string, token: string) {
        Promise.all([
            this.connection.del(owner + "_" + pair),
            this.connection.sadd("BL_" + owner, token),
        ]);
    }
}
