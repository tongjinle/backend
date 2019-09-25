import base from "./base";
import IConfig from "./iconfig";
const config: IConfig = {
  // mongo
  mongo: Object.assign({}, base.mongo, { dbName: "dev-cute2" }),
  // redis
  redis: Object.assign({}, base.redis, { dbName: 2 })
};

export default config;
