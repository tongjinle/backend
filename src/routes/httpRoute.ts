import * as express from "express";
import bottleRouter from "./bottleRouter";
import userRouter from "./userRouter";
import guestRouter from "./guestRouter";

// 路由
import testHandle from "./testHandle";

export default function handler(app: express.Express) {
  // 客人
  app.use("/guest", guestRouter);

  // 瓶子
  app.use("/bottle", bottleRouter);

  // 用户
  app.use("/user", userRouter);

  // 测试
  testHandle(app);
}
