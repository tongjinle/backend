import * as express from "express";
import * as protocol from "../protocol";
import * as userService from "../service/user";
import * as joi from "@hapi/joi";
import { getRedisClient } from "../redis";
import * as redisKey from "../redisKey";

let router = express.Router();

// 模糊查找用户
router.get("/find", async (req, res) => {
  console.log("in add");

  let reqData: { name: string } = req.query;
  let resData: { code: number; list: userService.UserInfo[] };

  let { name } = reqData;

  {
    let result = joi.validate(reqData, { name: joi.string().required() });
    if (result.error) {
      console.error(result.error);
      res.json({ code: -1, message: "缺少模糊用户名" });
      return;
    }
  }

  let data = await userService.findByName(name);
  let list = data.map(n => n);
  resData = { code: 0, list };
  res.json(resData);
});

// 设置用户状态
router.post("/setStatus", async (req, res) => {
  let reqData: { userId: string; status: string } = req.body;
  let resData: { code: 0 };

  {
    let result = joi.validate(reqData, {
      userId: joi.string().required(),
      status: joi
        .string()
        .allow("forzen", "normal")
        .required()
    });
    if (result.error) {
      console.error(result.error);
      res.json({ code: -1, message: "参数不合法" });
      return;
    }
  }

  let userId = reqData.userId;
  let status: userService.Status = reqData.status as userService.Status;

  await userService.setStatus(userId, status);

  // redis
  {
    let client = await getRedisClient();
    let key = redisKey.isUserFrozen(userId);
    if (status === "normal") {
      await client.del(key);
    }
  }

  resData = { code: 0 };
  res.json(resData);
});

// 增加用户coin(可以是赋值)
router.post("/coin", async (req, res) => {
  let reqData: { userId: string; coin: number } = req.body;
  let resData: { code: number };
  {
    let result = joi.validate(reqData, {
      userId: joi.string().required(),
      coin: joi
        .number()
        .integer()
        .required()
    });
    if (result.error) {
      console.error(result.error);
      res.json({ code: -1, message: "参数不合法" });
      return;
    }
  }

  let userId = reqData.userId;
  let coin = reqData.coin;

  await userService.updateCoin(userId, coin);
  resData = { code: 0 };
  res.json(resData);
});

export default router;
