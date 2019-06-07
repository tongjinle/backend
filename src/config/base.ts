import IConfig from "./iconfig";
import { HOUR } from "../constant";
const config: IConfig = {
  protocol: "http",
  host: "localhost",
  port: 3000,

  connectStr: "mongodb://tea:sannian@118.31.11.29:27017",
  dbName: "zst",

  redis: {
    host: "118.31.11.29",
    port: 6379,
    pass: "sannian"
  },
  wx: {
    appId: "",
    appSecret: "",
    // 信息模版Id
    templateId: ""
  },

  // ******** special for project ********
  defaultCoin: 20,
  fetchCoinMax: 100,
  fetchCoinMin: 10
};

export default config;
