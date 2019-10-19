import IConfig from "./iconfig";
import { HOUR } from "../constant";
const config: IConfig = {
  protocol: "http",
  host: "localhost",
  port: 3000,
  // mongo
  mongo: {
    connectStr: "mongodb://tea:sannian@api.puman.xyz:27017",
    // connectStr: "mongodb://tea:sannian@120.27.27.50:27017",
    dbName: "zst"
  },
  // redis
  redis: {
    // host: "120.27.27.50",
    host: "api.puman.xyz",
    port: 6379,
    pass: "sannian",
    dbName: 1
  },
  wx: {
    appId: "wx09bbbd445c8b772f",
    appSecret: "10dbfe2215c799c60bd113f69a3f6ebc",
    // 信息模版Id
    templateId: "rbrtfn6Qt0UYaI3G6hnBUjr6Vikoz5Q9B1Wdvk4q82E"
  },
  wxOpenIdUrl: "https://api.sanriyue.xyz/commonApi/wx/openId",
  qq: {
    appId: "1109682478",
    appSecret: "re79cmI7cYwqGZzE",
    // 信息模版Id
    templateId: "rbrtfn6Qt0UYaI3G6hnBUjr6Vikoz5Q9B1Wdvk4q82E"
  },
  qqOpenIdUrl: "https://api.sanriyue.xyz/commonApi/qq/openId",
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
