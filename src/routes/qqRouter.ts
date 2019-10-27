import "@hapi/joi";
import * as express from "express";
import * as request from "request";
import config from "../config";
import * as protocol from "../protocol";
import * as userService from "../service/user";
import utils from "../utils";
import { getAccessToken } from "../service/minProg";
import axios from "axios";
import { access } from "fs";
import * as redisKey from "../redisKey";
import { getRedisClient } from "../redis";
import { HOUR } from "../constant";
import * as minProg from "../service/minProg";

let router = express.Router();

let appId: string = config.qq.appId;
let appSecret: string = config.qq.appSecret;

let openIdUrl = config.qqOpenIdUrl;
// 登录
router.get("/openId/", async (req, res) => {
  let resData: { userId: string; token: string } & protocol.IResBase;
  let reqData: { code: string; platformName: "wx" | "qq" } = req.query;
  let { platformName, code } = reqData;
  try {
    let { openId, token } = await minProg.getOpenId(platformName, code);
    resData = { code: 0, userId: openId, token };
  } catch (e) {
    res.json({ code: 900 });
    return;
  }
  res.json(resData);
});

// accessToken
router.get("/accessToken", async (req, res) => {
  let resData: { accessToken: string } & protocol.IResBase;
  let reqData: {} = req.query;
  let accessToken = await getCacheAccessToken();
  resData = { code: 0, accessToken };
  res.json(resData);
});

// 检测图片
router.get("/imgSecCheck", async (req, res) => {
  let resData: { check: boolean } & protocol.IResBase;
  let reqData: { url: string } = req.query;
  let accessToken = await getCacheAccessToken();
  let check: boolean = false;

  {
    let imageUrl = reqData.url;
    let res = await axios.get(
      "https://api.sanriyue.xyz/commonApi/qq/imgSecCheck",
      {
        params: {
          appId,
          accessToken,
          imageUrl
        }
      }
    );
    check = res.data.check;
  }
  resData = { code: 0, check };
  res.json(resData);
});

//检测文本

// 获取本地的accessToken
// 将其保存在redis中
async function getCacheAccessToken(): Promise<string> {
  let rst: string;
  let key = redisKey.accessToken("qq");

  let client = await getRedisClient();
  if (await client.exists(key)) {
    rst = await client.get(key);
  } else {
    let accessTokenUrl = config.qqAccessTokenUrl;
    let appId = config.qq.appId;
    let appSecret = config.qq.appSecret;
    let res = await axios.get(accessTokenUrl, {
      params: {
        appId,
        appSecret
      }
    });
    rst = res.data.accessToken;
    await client.set(key, rst);
    await client.pexpire(key, 1.5 * HOUR);
  }
  return rst;
}

export default router;
