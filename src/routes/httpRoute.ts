import * as express from "express";

// 路由
import testHandle from "./testHandle";
import wxRouter from "./wxRouter";
import guestRouter from "./guestRouter";
import userRouter from "./userRouter";

// 错误

export default function handler(app: express.Express) {
  // 测试
  testHandle(app);

  // 微信登录
  app.use(wxRouter);

  // 访客路由
  app.use(guestRouter);

  // 用户路由
  app.use(userRouter);
}
