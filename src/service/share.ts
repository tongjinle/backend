import utils from "../utils";
import { getMongoClient, getCollection } from "../mongo";
import config from "../config";
import { func } from "@hapi/joi";

// 分享
/**
 * 获取分享码
 * @param userId
 * @returns 返回分享码,分享码具有时效性
 */
export async function shareCode(userId: string): Promise<string> {
  return utils.getShareCode(userId);
}

/**
 * 分享码是否有效
 * @param userId 用户id
 * @param shareCode 分享码
 */
export async function isShareCodeValid(
  userId: string,
  shareCode: string
): Promise<boolean> {
  return utils.isShareCodeValid(userId, shareCode);
}

/**
 * 是否已经分享
 * @param userId
 * @param year
 * @param month
 * @param day
 * @returns 返回某天是否分享了
 */
export async function isShared(
  userId: string,
  year: number,
  month: number,
  day: number
): Promise<boolean> {
  let rst: boolean;
  let coll = await getCollection("share");
  rst = !!(await coll.findOne({ userId, year, month, day }));
  return rst;
}

/**
 * 分享
 * @param userId
 * @param year
 * @param month
 * @param day
 * @returns 返回成功分享后的代币奖励
 */
export async function share(
  userId: string,
  year: number,
  month: number,
  day: number
): Promise<number> {
  let rst: number;
  let coll = await getCollection("share");
  let coin: number = utils.getShareCoin();
  await coll.insertOne({ userId, year, month, day, coin, time: new Date() });
  rst = coin;
  return rst;
}

/**
 * 是否对分享发起人已经奖励过
 * @param userId 被分享人userId
 * @param sharerId 分享发起人的userId
 * @returns 是否奖励过
 */
export async function isRewarded(
  userId: string,
  sharerId: string
): Promise<boolean> {
  let rst: boolean = true;
  let coll = await getCollection("shareLink");

  rst = !!(await coll.findOne({ userId, sharerId }));

  return rst;
}

/**
 * 分享获取新用户的奖励
 * @param userId 被分享人userId
 * @param sharerId 分享发起人的userId
 * @returns 返回代币奖励
 */
export async function reward(
  userId: string,
  sharerId: string
): Promise<number> {
  let rst: number;
  let coll = await getCollection("shareLink");
  let coin = utils.getShareCoin();
  await coll.insertOne({
    userId,
    sharerId,
    coin,
    time: new Date()
  });
  rst = coin;
  return rst;
}
