import utils from "../utils";
import { getMongoClient } from "../getMongoClient";
import config from "../config/dev";

// 分享

// 获取分享code
export async function code(userId: string): Promise<string> {
  return utils.getShareCode(userId);
}

// 是否已经分享
export async function isShare(
  userId: string,
  year: number,
  month: number,
  day: number
): Promise<boolean> {
  let rst: boolean;
  let mongo = await getMongoClient();
  rst = !!(await mongo
    .db(config.dbName)
    .collection("share")
    .findOne({ userId, year, month, day }));
  return;
}

// 分享
export async function share(
  userId: string,
  year: number,
  month: number,
  day: number
): Promise<number> {
  let rst: number;
  let mongo = await getMongoClient();
  let coin: number = utils.getShareCoin();
  await mongo
    .db(config.dbName)
    .collection("share")
    .insertOne({ userId, year, month, day, coin, time: new Date() });
  rst = coin;
  return rst;
}

// 能否成功分享
// 1 userId不在user表中
// 2 inviterId和shareCode能对应
export async function isShareSuccess(
  userId: string,
  inviterId: string,
  shareCode: string
): Promise<boolean> {
  let rst: boolean = true;
  let mongo = await getMongoClient();

  if (utils.getShareCode(inviterId) !== shareCode) {
    return false;
  }

  if (
    !!(await mongo
      .db(config.dbName)
      .collection("user")
      .findOne({ userId }))
  ) {
    return false;
  }

  return rst;
}
// 分享成功,获取新用户
export async function shareSuccess(
  userId: string,
  inviterId: string
): Promise<number> {
  let rst: number;
  let mongo = await getMongoClient();
  await mongo
    .db(config.dbName)
    .collection("shareLink")
    .insertOne({
      userId,
      inviterId,
      time: new Date()
    });
  rst = utils.getShareCoin();
  return rst;
}
