import express = require("express");
import * as joi from "@hapi/joi";
import errs from "../../errCode";
import utils from "../../utils";
import * as userService from "../../service/user";
import { getRedisClient } from "../../redis";
import * as redisKey from "../../redisKey";
import { MIN } from "../../constant";
import { min } from "moment";

export default async function userCheck(
  req: express.Request,
  res: express.Response,
  next: Function
) {
  let flag: boolean;
  flag = true;

  let userId: string = req.header("userId");
  let token: string = req.header("token");
  console.log({ userId, token });
  let result = joi.validate(
    { userId, token },
    {
      userId: joi.string().required(),
      token: joi.string().required()
    }
  );

  if (result.error) {
    console.error(result.error);
    res.json(errs.common.invalidParams);
    return;
  }

  if (token !== utils.getUserToken(userId)) {
    res.json(errs.common.wrongToken);
    return;
  }

  // 用户是否被冻结
  // '1'表示冻结,'0'表示正常状态
  {
    let client = await getRedisClient();
    let key = redisKey.isUserFrozen(userId);
    if (!(await client.exists(key))) {
      let user = await userService.find(userId);
      if (user) {
        await client.set(key, user.status === "normal" ? "0" : "1");
        await client.expire(key, 30 * MIN);
      }
    }
    let data = await client.get(key);
    if (data === "1") {
      res.json(errs.common.frozen);
      return;
    }
  }

  console.log("check user role:", flag);
  next();
}
