import IConfig from "./iconfig";
import { HOUR } from "../constant";
const config: IConfig = {
  protocol: "http",
  host: "localhost",
  port: 3000,

  connectStr: "mongodb://tea:sannian@api.sanriyue.xyz:27017",
  dbName: "dev-cute",

  wx: {
    appId: "wx09bbbd445c8b772f",
    appSecret: "10dbfe2215c799c60bd113f69a3f6ebc",
    // 信息模版Id
    templateId: "rbrtfn6Qt0UYaI3G6hnBUjr6Vikoz5Q9B1Wdvk4q82E"
  },

  qq: {
    appId: "1110007460",
    appSecret: "d6rPr1tWiP3Po6l7",
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
