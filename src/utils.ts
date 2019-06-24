import config from "./config";
import moment = require("moment");

// *** 存放一些通用方法 ***
function getSignCoin(year: number, month: number, day: number): number {
  let signCoin = config.signCoin;
  let date = new Date(year, month, day);
  let isWeekDay: boolean = [1, 7].indexOf(date.getDay()) >= 0;
  return isWeekDay ? signCoin.max : signCoin.min;
}

let utils = { getSignCoin };

export default utils;
