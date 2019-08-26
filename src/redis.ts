import * as redis from "handy-redis";
import { EventEmitter } from "events";
import config from "./config";
import utils from "./utils";

// 数据库状态
enum eStatus {
  open,
  close
}
let { port, host, pass } = config.redis;
class RedisDb extends EventEmitter {
  db: redis.IHandyRedis;
  status: eStatus;

  private static ins: RedisDb;

  static async getIns(): Promise<RedisDb> {
    let ins = (RedisDb.ins = RedisDb.ins || new RedisDb());
    if (ins.status === eStatus.close) {
      await ins.connect();
    }
    return ins;
  }

  private constructor() {
    super();
    this.status = eStatus.close;
  }

  connect(): Promise<boolean> {
    return new Promise(resolve => {
      this.db = redis.createHandyClient(config.redis.port, config.redis.host, {
        password: config.redis.pass
      });
      this.db.redis.on("connect", () => {
        this.status = eStatus.open;
        resolve(true);
      });
    });
  }

  close(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.quit().then(value => {
        console.log("on quit:", value);
        this.status = eStatus.close;
        resolve(true);
      });
      // this.db.redis.end(true);
      // this.db.redis.quit(() => {
      //   console.log("redis quit");
      // });
      // this.db.redis.on("end", () => {
      //   console.log("redis client close");
      // });
    });
  }
}

export default RedisDb;
