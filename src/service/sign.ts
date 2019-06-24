import config from "../config";
import { getMongoClient } from "../getMongoClient";
import utils from "../utils";

// 是否已经签到
export async function isSign(
  userId: string,
  year: number,
  month: number,
  day: number
): Promise<boolean> {
  let rst: boolean;

  let mongo = await getMongoClient();
  rst = !!(await mongo
    .db(config.dbName)
    .collection("sign")
    .findOne({ userId, year, month, day }));

  return rst;
}

// 签到
export async function sign(
  userId: string,
  year: number,
  month: number,
  day: number
): Promise<number> {
  let rst: number = 0;

  let mongo = await getMongoClient();

  let coin = utils.getSignCoin(year, month, day);

  await mongo
    .db(config.dbName)
    .collection("sign")
    .insertOne({ userId, year, month, day, coin, time: new Date() });

  return rst;
}

// 签到信息
export type SignInfo = {
  day: number;
  coin: number;
};
// 获取我的签到信息
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
