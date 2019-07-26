import * as express from "express";

// 路由
import testHandle from "./testHandle";
import wxRouter from "./wxRouter";
import qqRouter from "./qqRouter";
import guestRouter from "./guestRouter";
import userRouter from "./userRouter";

// 错误

export default function handler(app: express.Express) {
  // 测试
  testHandle(app);

  // 微信登录
  app.use("/wx", wxRouter);

  // qq登录
  app.use("/qq", qqRouter);

  // 访客路由
  app.use(guestRouter);

  // 用户路由
  app.use("/user", userRouter);
}
