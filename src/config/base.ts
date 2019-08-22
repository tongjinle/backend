import IConfig from "./iconfig";
import { HOUR } from "../constant";
const config: IConfig = {
  protocol: "http",
  host: "localhost",
  port: 8003,
  // connectStr: "mongodb://tea:sannian@118.31.11.29:27017",
  connectStr: "mongodb://localhost:27017",
  dbName: "zst",

  wx: {
    appId: "wx09bbbd445c8b772f",
    appSecret: "10dbfe2215c799c60bd113f69a3f6ebc",
    // 信息模版Id
    templateId: "rbrtfn6Qt0UYaI3G6hnBUjr6Vikoz5Q9B1Wdvk4q82E"
  },

  qq: {
    appId: "1109682478",
    appSecret: "re79cmI7cYwqGZzE",
    // 信息模版Id
    templateId: "rbrtfn6Qt0UYaI3G6hnBUjr6Vikoz5Q9B1Wdvk4q82E"
  },

  // token过期时间
  tokenExpires: 2 * HOUR,

  mockToken: "sannian.zst",
  mockOpenId: "sannian.zst",

  // ******** special for project ********
  signCoin: {
    min: 10,
    max: 20
  },
  shareCoin: 10,
  shareCode: "sannian",
  // 这个不能改了,如果改动,前面原始的用户的token都会失效
  userCode: "*UHB7ygv6tfc"
};

export default config;
