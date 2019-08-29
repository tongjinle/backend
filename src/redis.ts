import * as redis from "handy-redis";
import { EventEmitter } from "events";
import config from "./config";
import utils from "./utils";

// 数据库状态
enum eStatus {
  open,
  close
}
let { port, host, pass, dbName } = config.redis;

let client: redis.IHandyRedis;
export async function getRedisClient(): Promise<redis.IHandyRedis> {
  if (!client) {
    return new Promise(resolve => {
      client = redis.createHandyClient(port, host, { password: pass });
      client.redis.on("connect", async () => {
        console.log("connect success");
        await client.select(dbName);
        resolve(client);
      });

      client.redis.on("error", error => {
        console.log("occur error");
      });
      // setTimeout(async () => {
      //   console.log("quit...");
      //   await client.quit();
      //   client = undefined;
      // }, 60 * 1000);
    });
  }
  return client;
}

export async function closeRedisClient() {
  if (client) {
    return new Promise(resolve => {
      client.redis.quit(resolve);
    });
  }
}
