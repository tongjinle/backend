import config from "./config";
import md5 = require("md5");

// *** 存放一些通用方法 ***

// 获取某日签到得到的代币奖励
function getSignCoin(year: number, month: number, day: number): number {
  let signCoin = config.signCoin;
  let date = new Date(year, month, day);
  let isWeekDay: boolean = [0, 6].indexOf(date.getDay()) >= 0;
  return isWeekDay ? signCoin.max : signCoin.min;
}

/**
 * 获取分享码
 * @param userId
 * @returns 返回分享码,分享码具有时效性
 */
function getShareCode(userId: string): string {
  let code: string = config.shareCode;
  let time = new Date();
  let timecode = [time.getFullYear(), time.getMonth(), time.getDate()].join(
    "#"
  );
  return md5(userId + timecode + code);
}

/**
 * 分享码是否有效
 * @param userId 用户id
 * @param shareCode 分享码
 */
function isShareCodeValid(userId: string, shareCode: string): boolean {
  let code: string = config.shareCode;
  // 时效性为3天
  let count = 3;

  let now = new Date();
  for (let i = 0; i < count; i++) {
    let time = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    let timecode = [time.getFullYear(), time.getMonth(), time.getDate()].join(
      "#"
    );
    if (md5(userId + timecode + code) === shareCode) {
      return true;
    }
  }

  return false;
}

/**
 * 获取分享得到的代币奖励
 * @returns 返回代币奖励
 */
function getShareCoin(): number {
  return config.shareCoin;
}

function getUserToken(userId: string): string {
  let code: string = config.userCode;
  return md5(userId + code);
}

let utils = {
  getSignCoin,
  getShareCode,
  isShareCodeValid,
  getShareCoin,
  getUserToken
};

export default utils;
