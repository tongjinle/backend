import config from "../config";
import { getMongoClient, getCollection } from "../getMongoClient";
import utils from "../utils";

/**
 * 是否已经签到
 * @param userId
 * @param year
 * @param month
 * @param day
 * @returns 已经签到返回true
 */
export async function isSigned(
  userId: string,
  year: number,
  month: number,
  day: number
): Promise<boolean> {
  let rst: boolean;

  let coll = await getCollection("sign");
  rst = !!(await coll.findOne({ userId, year, month, day }));

  return rst;
}

/**
 * 签到
 * @param userId
 * @param year
 * @param month
 * @param day
 * @returns 签到得到的奖励的代币数量
 */
export async function sign(
  userId: string,
  year: number,
  month: number,
  day: number
): Promise<number> {
  let rst: number = 0;

  let coll = await getCollection("sign");
  let coin = utils.getSignCoin(year, month, day);
  await coll.insertOne({ userId, year, month, day, coin, time: new Date() });

  rst = coin;
  return rst;
}

// 签到信息
export type SignInfo = {
  day: number;
  coin: number;
};

/**
 * 获取我的签到信息
 * @param userId
 * @param year 签到的某年
 * @param month 签到的某月
 * @returns 返回某月的签到情况的数组
 */
export async function signList(
  userId: string,
  year: number,
  month: number
): Promise<SignInfo[]> {
  let rst: SignInfo[] = [];
  let mongo = await getMongoClient();
  let data = await mongo
    .db(config.dbName)
    .collection("sign")
    .find({
      userId,
      year,
      month
    })
    .sort({ day: 1 })
    .toArray();
  rst = data.map(n => ({
    day: n.day,
    coin: n.coin
  }));
  return rst;
}
