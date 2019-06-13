import IConfig from "./iconfig";
const config: IConfig = {
  protocol: "https",
  host: "api.puman.xyz",
  // 因为会使用nginx代理
  port: 8004,
  dbName: "bottle"
};

export default config;
