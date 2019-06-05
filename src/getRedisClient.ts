import * as handyRedis from "handy-redis";
import config from "./config/index";

let client: handyRedis.IHandyRedis;
async function getRedisClient(): Promise<handyRedis.IHandyRedis> {
  if (!client) {
    return new Promise(resolve => {
      let { port, host, pass } = config.redis;
      client = handyRedis.createHandyClient(port, host, {
        password: pass
      });

      client.redis.once("connect", () => {
        resolve(client);
      });
    });
  }
  return client;
}

export default getRedisClient;
