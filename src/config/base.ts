import IConfig from "./iconfig";
import { HOUR } from "../constant";
const config: IConfig = {
  protocol: "http",
  host: "localhost",
  port: 3000,

  connectStr: "mongodb://tea:sannian@118.31.11.29:27017",
  dbName: "zst",

  wx: {
    appId: "wx09bbbd445c8b772f",
    appSecret: "10dbfe2215c799c60bd113f69a3f6ebc",
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
