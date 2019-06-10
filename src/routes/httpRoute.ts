import * as express from "express";
import bottleRouter from "./bottleRouter";

// 路由
import testHandle from "./testHandle";

export default function handler(app: express.Express) {
  // 瓶子
  app.use("/bottle", bottleRouter);

  // 测试
  testHandle(app);
}
