import IConfig from "./iconfig";
import { HOUR } from "../constant";
const config: IConfig = {
  protocol: "http",
  host: "localhost",
  port: 3000,

  connectStr: "mongodb://tea:sannian@118.31.11.29:27017",
  dbName: "zst",

  wx: {
    appId: "wx70b1a409c7292feb",
    appSecret: "befb5c145897d423f8c25282204292b4",
    // 信息模版Id
    templateId: "rbrtfn6Qt0UYaI3G6hnBUjr6Vikoz5Q9B1Wdvk4q82E"
  },

  // token过期时间
  tokenExpires: 2 * HOUR,

  mockToken: "sannian.zst",
  mockOpenId: "sannian.zst"

  // ******** special for project ********
};

export default config;
