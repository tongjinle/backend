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

  // 微信
  wx: {
    appId: string;
    appSecret: string;
    templateId: string;
  };
  // token过期时间
  tokenExpires: number;

  // mock
  mockToken: string;
  mockOpenId: string;
}

// 根据项目需求而定的接口
interface IConfigDynamic {}

interface IConfig extends Partial<IConfigBase>, Partial<IConfigDynamic> {}

export default IConfig;
