import * as express from "express";

// 路由
import testHandle from "./testHandle";
import minProgRouter from "./minProgRouter";
import wxRouter from "./wxRouter";
import qqRouter from "./qqRouter";
import userRouter from "./userRouter";
import signRouter from "./signRouter";
import shareRouter from "./shareRouter";
import noticeRouter from "./noticeRouter";
import diaryRouter from "./diaryRouter";
import raceRouter from "./raceRouter";
import guestRouter from "./guestRouter";
import raceAdminRouter from "./raceAdminRouter";
import postAdminRouter from "./postAdminRouter";
import userAdminRouter from "./userAdminRouter";
import databaseAdminRouter from "./databaseAdminRouter";
import adminCheck from "./role/adminCheck";

// 错误

export default function handler(app: express.Express) {
  // 测试
  testHandle(app);

  // 小程序通用相关
  app.use("/minProg", minProgRouter);

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
  app.use("/notice", noticeRouter);

  // 日记
  app.use("/diary", diaryRouter);

  // 比赛
  app.use("/race", raceRouter);

  // guest
  app.use("/guest", guestRouter);

  // 管理-比赛
  app.use("/admin/race", adminCheck, raceAdminRouter);

  // 管理-海报
  app.use("/admin/post", adminCheck, postAdminRouter);

  // 管理-用户
  app.use("/admin/user", adminCheck, userAdminRouter);

  // 管理-数据
  app.use("/admin/database", adminCheck, databaseAdminRouter);
}
