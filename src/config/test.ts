import base from "./base";
import IConfig from "./iconfig";
const config: IConfig = {
  port: 3001,
  // mongo
  mongo: Object.assign({}, base.mongo, { dbName: "test-cute2" }),
  // redis
  redis: Object.assign({}, base.redis, { dbName: 3 })
};

export default config;
