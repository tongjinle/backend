import IConfig from "./iconfig";
const config: IConfig = {
  // mongo
  mongo: {
    connectStr: "mongodb://tea:sannian@118.31.11.29:27017",
    dbName: "dev-cute2"
  },
  // redis
  redis: {
    host: "118.31.11.29",
    port: 6379,
    pass: "sannian",
    dbName: 2
  }
};

export default config;
