import { getMongoClient, getCollection } from "../getMongoClient";
import config from "../config";
import { UserInfo } from "./user";

// 代币

// 查询代币
/**
 * 查询代币
 * @deprecated
 * @param userId 用户id
 * @returns 返回用户代币,如果用户不存在,返回0
 */
export async function find(userId: string): Promise<number> {
  let rst: number = 0;
  let coll = await getCollection("user");
  let data: UserInfo = await coll.findOne({ userId });
  if (data) {
    rst = data.coin;
  }
  return rst;
}

/**
 * 修改代币(以增量方式)
 * @param userId 用户id
 * @param coin 代币增量,可以是负数
 */
export async function update(userId: string, coin: number): Promise<void> {
  let coll = await getCollection("user");
  await coll.updateOne({ userId }, { $inc: { coin } });
}

/**
 * 账单类型
 */
export enum BillType {
  /**
   * 收入
   */
  income = "income",
  /**
   * 支出
   */
  pay = "pay",
  /**
   * 退款
   */
  back = "back"
}

/***
 * 账单项
 */
export type Bill = {
  /**
   * 账单类型
   */
  type: BillType;
  /**
   * 简单文本描述
   */
  text: string;
  /**
   * 代币数量
   */
  coin: number;
  /**
   * 账单时间
   */
  time: Date;
};

// 我的账单
export async function list(userId: string, limit: number): Promise<Bill[]> {
  let rst: Bill[] = [];
  let coll = await getCollection("bill");

  let data = await coll
    .find({ userId })
    .limit(limit)
    .sort({ time: -1 })
    .toArray();

  rst = data.map(n => ({
    type: n.type,
    text: n.text,
    coin: n.coin,
    time: n.time
  }));

  return rst;
}
