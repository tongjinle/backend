import * as handyRedis from "handy-redis";
import config from "./config/index";
import { executionAsyncId } from "async_hooks";

let client: handyRedis.IHandyRedis;
export async function getRedisClient(): Promise<handyRedis.IHandyRedis> {
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

export async function closeRedisClient(): Promise<void> {
  if (client) {
    await client.redis.quit();
  }
  client = undefined;
}
