import IConfig from "./iconfig";
const config: IConfig = {
  port: 924,
  // mongo
  mongo: {
    connectStr: "mongodb://tea:sannian@118.31.11.29:27017",
    dbName: "test-cute2"
  },
  // redis
  redis: {
    host: "118.31.11.29",
    port: 6379,
    pass: "sannian",
    dbName: 3
  }
};

export default config;
