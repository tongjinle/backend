import * as express from "express";

// 路由
import testHandle from "./testHandle";
import wxRouter from "./wxRouter";
import qqRouter from "./qqRouter";
import userRouter from "./userRouter";
import signRouter from "./signRouter";
import shareRouter from "./shareRouter";
import noticeRouter from "./noticeRouter";

// 错误

export default function handler(app: express.Express) {
  // 测试
  testHandle(app);

  // 微信登录
  app.use("/wx", wxRouter);

  // qq登录
  app.use("/qq", qqRouter);

  // 用户路由
  app.use("/user", userRouter);

  // 签到路由
  app.use("/sign", signRouter);

  // 分享路由
  app.use("/share", shareRouter);

  // 官方通知
  app.use("/user/notice", noticeRouter);
}
