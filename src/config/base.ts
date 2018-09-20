import IConfig from "./iconfig";
import { HOUR } from "../constant";
const config: IConfig = {
  protocol: "http",
  host: "localhost",
  port: 3000,

  connectStr: "mongodb://118.31.11.29:27017",
  dbName: "zst",

  wx: {
    appId: "wx76c2cfaf352e3a62",
    appSecret: "61925af2bb3d710aa2e84699b9cf0466",
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
