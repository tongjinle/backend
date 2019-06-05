interface IConfigBase {
  // 协议
  protocol: string;
  // 域名
  host: string;
  // 端口
  port: number;
  // 数据库名字
  dbName: string;
  // 数据库连接字符串
  connectStr: string;

  // redis
  redis: {
    port: number;
    host: string;
    pass: string;
  };

  // 微信
  wx: {
    appId: string;
    appSecret: string;
    templateId: string;
  };
  // token过期时间
  tokenExpires: number;
}

// 根据项目需求而定的接口
interface IConfigDynamic {
  // 注册赠送的金币
  defaultCoin: number;
  // 打捞金币的最小值
  fetchCoinMin: number;
  // 打捞金币的最大值
  fetchCoinMax: number;
}

interface IConfig extends Partial<IConfigBase>, Partial<IConfigDynamic> {}

export default IConfig;
