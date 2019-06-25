import config from "./config";
import moment = require("moment");
import md5 = require("md5");
import { func } from "@hapi/joi";

// *** 存放一些通用方法 ***

// 获取某日签到得到的代币奖励
function getSignCoin(year: number, month: number, day: number): number {
  let signCoin = config.signCoin;
  let date = new Date(year, month, day);
  let isWeekDay: boolean = [1, 7].indexOf(date.getDay()) >= 0;
  return isWeekDay ? signCoin.max : signCoin.min;
}

// 获取分享code
function getShareCode(userId: string): string {
  let code: string = config.shareCode;
  return md5(userId + code);
}

// 获取分享得到的代币奖励
function getShareCoin(): number {
  return config.shareCoin;
}

function getUserToken(userId: string): string {
  let code: string = config.userCode;
  return md5(userId + code);
}

let utils = { getSignCoin, getShareCode, getShareCoin, getUserToken };

export default utils;
