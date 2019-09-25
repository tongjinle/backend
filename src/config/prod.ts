import base from "./base";
import IConfig from "./iconfig";
const config: IConfig = {
  port: 8003,

  // mongo
  mongo: Object.assign({}, base.mongo, { dbName: "cute2" }),
  // redis
  redis: Object.assign({}, base.redis, { dbName: 1 })
};

export default config;
