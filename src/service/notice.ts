// 通知
import config from "../config";
import { getMongoClient, getCollection, getObjectId } from "../getMongoClient";
import utils from "../utils";

export enum NoticeType {
  normal = "normal",
  back = "back",
  shareReward = "shareReward"
}

export interface INotice {
  id: string;
  // 文本
  text: string;
  // 金币数量
  coin?: number;
  // 通知类型
  // normal
  // back是退款
  // shareReward是转发成功获取用户的奖励
  type: "normal" | "back" | "shareReward";
  // 官方发放notice时候的时间戳
  timestamp: number;
  // 阅读的时间戳
  // 不存在该字段就是"未读"
  readTimestamp?: number;
}

const NOTICE = "notice";

/**
 * 通知列表
 * @param userId 用户id
 */
export async function list(userId: string): Promise<INotice[]> {
  let rst: INotice[] = [];

  let coll = await getCollection(NOTICE);
  let data = await coll.find({ userId }).toArray();

  rst = data.map(n => {
    return {
      id: n._id.toString(),
      text: n.text,
      coin: n.coin,
      type: n.type,
      timestamp: n.timestamp,
      readTimestamp: n.readTimestamp
    };
  });

  return rst;
}

/**
 * 增加一条通知
 * @param userId 用户编号
 * @param text 文本
 * @param coin 通知中附带的代币
 * @param type 通知类型
 */
export async function add(
  userId: string,
  text: string,
  coin: number,
  type: NoticeType
): Promise<void> {
  let coll = await getCollection(NOTICE);
  await coll.insertOne({ userId, text, coin, timestamp: Date.now() });
}

/**
 * 用户是否对该通知有权限
 * @param id 通知id
 * @param userId 用户id
 */
export async function canAction(id: string, userId: string): Promise<boolean> {
  let rst: boolean;
  let coll = await getCollection(NOTICE);
  rst = !!(await coll.findOne({ _id: getObjectId(id), userId }));
  return rst;
}

/**
 * 删除通知
 * @param id 通知id
 */
export async function remove(id: string): Promise<void> {
  let coll = await getCollection(NOTICE);
  await coll.deleteOne({ _id: getObjectId(id) });
}

/**
 * 阅读通知
 * @param id 通知id
 */
export async function read(id: string): Promise<void> {
  let coll = await getCollection(NOTICE);
  await coll.updateOne(
    { _id: getObjectId(id) },
    { $set: { readTimestamp: Date.now() } }
  );
}
