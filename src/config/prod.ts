import IConfig from "./iconfig";
const config: IConfig = {
  protocol: "https",
  host: "api.puman.xyz",
  // 因为会使用nginx代理
  port: 8100
};

export default config;
