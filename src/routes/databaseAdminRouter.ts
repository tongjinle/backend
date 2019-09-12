import * as express from "express";
import * as protocol from "../protocol";
import * as databaseService from "../service/database";

import * as joi from "@hapi/joi";

let router = express.Router();

// 获取数据恢复选项列表
router.get("/list", async (req, res) => {
  let resData: { code: number; list: string[] };
  let list = await databaseService.list();
  resData = { code: 0, list };
  res.json(resData);
});

// 恢复数据
router.post("/recover", async (req, res) => {
  let reqData = req.body;
  let resData: { code: number };

  {
    let result = joi.validate(reqData, { name: joi.string().required() });
    if (result.error) {
      res.json({ code: -1 });
      return;
    }
  }

  await databaseService.recover(name);
  resData = { code: 0 };
  res.json(resData);
});

export default router;
