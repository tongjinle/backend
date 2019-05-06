import * as express from "express";
import ErrCode from "../errCode";

import config from "../config";
import loger from "../logIns";
import Database from "../db";

// 路由
import testHandle from "./testHandle";

// 错误
import errCode from "../errCode";

export default function handler(app: express.Express) {
  // 测试
  testHandle(app);
}
