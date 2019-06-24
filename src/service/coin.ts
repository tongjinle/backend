import { getMongoClient } from "../getMongoClient";
import config from "../config";

// 代币

// 查询代币
export async function coin(userId: string): Promise<number> {
  let rst: number = 0;
  let mongo = await getMongoClient();
  let data = await mongo
    .db(config.dbName)
    .collection("user")
    .findOne({ userId });
  if (data) {
    rst = data.coin;
  }
  return rst;
}

// 账单项
export type Bill = {
  // 收入,支出,退款
  type: "income" | "pay" | "back";
  // 简单文本描述
  text: string;
  // 代币数量
  coin: number;
  time: Date;
};

// 我的账单
export async function bill(
  userId: string,
  limit: number = 20
): Promise<Bill[]> {
  let rst: Bill[] = [];
  let mongo = await getMongoClient();

  let data = await mongo
    .db(config.dbName)
    .collection("bill")
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
// 修改代币(以增量方式)
export async function updateCoin(userId: string, coin: number): Promise<void> {
  let mongo = await getMongoClient();
  await mongo
    .db(config.dbName)
    .collection("user")
    .updateOne({ userId }, { $inc: { coin } });
}
