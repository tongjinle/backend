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
import { platform } from "os";

let router = express.Router();

let appId: string = config.qq.appId;
let appSecret: string = config.qq.appSecret;

let openIdUrl = config.qqOpenIdUrl;

type PlatformName = minProg.PlatformName;

// 登录
router.get("/login/", async (req, res) => {
  let resData: { userId: string; token: string } & protocol.IResBase;
  let reqData: { code: string; platformName: PlatformName } = req.query;
  let { platformName, code } = reqData;
  try {
    let { openId, token } = await minProg.getOpenId(platformName, code);
    resData = { code: 0, userId: openId, token };
  } catch (e) {
    res.json({ code: 900, message: "获取openId失败" });
    return;
  }
  res.json(resData);
});

// accessToken
router.get("/accessToken", async (req, res) => {
  let resData: { accessToken: string } & protocol.IResBase;
  let reqData: { platformName: PlatformName } = req.query;
  let accessToken = await minProg.getCacheAccessToken(reqData.platformName);
  resData = { code: 0, accessToken };
  res.json(resData);
});

// 检测图片
router.get("/imgSecCheck", async (req, res) => {
  let resData: { check: boolean } & protocol.IResBase;
  let reqData: { platformName: PlatformName; url: string } = req.query;

  let check: boolean = false;

  try {
    let { platformName, url } = reqData;
    check = await minProg.imgSecCheck(platformName, url);
    resData = { code: 0, check };
  } catch (e) {
    resData = { code: 0, check: false };
  }
  res.json(resData);
});

//检测文本
router.get("/msgSecCheck", async (req, res) => {
  let resData: { check: boolean } & protocol.IResBase;
  let reqData: { platformName: PlatformName; content: string } = req.query;

  let check: boolean = false;
  try {
    let { platformName, content } = reqData;
    check = await minProg.msgSecCheck(platformName, content);
    resData = { code: 0, check };
  } catch (e) {
    resData = { code: 0, check: false };
    console.log(e);
  }
  res.json(resData);
});

export default router;
