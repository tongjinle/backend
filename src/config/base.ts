import IConfig from "./iconfig";
import { HOUR } from "../constant";
const config: IConfig = {
  protocol: "http",
  host: "localhost",
  port: 3000,

  connectStr: "mongodb://tea:sannian@118.31.11.29:27017",
  dbName: "zst",

  redis: {
    host: "localhost",
    port: 6379,
    pass: "sannian"
  },
  wx: {
    appId: "",
    appSecret: "",
    // 信息模版Id
    templateId: ""
  }

  // ******** special for project ********
};

export default config;
