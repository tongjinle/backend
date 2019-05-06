import * as express from "express";
import ErrCode from "../errCode";

import config from "../config";
import loger from "../logIns";
import Database from "../db";

// 路由
import testHandle from "./testHandle";

import picHandle from "./picHandle";

// 错误
import errCode from "../errCode";

export default function handler(app: express.Express) {
  // 测试
  testHandle(app);

  // 图片资源
  picHandle(app);
}
