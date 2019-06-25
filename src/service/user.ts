import config from "../config";
import { getMongoClient } from "../getMongoClient";

export type Gender = "male" | "female";

// 基本用户信息
// 确认了不能修改
export type BasicInfo = {
  userId: string;
  nickname: string;
  gender: Gender;
};
// 扩展用户信息(可以修改)
export type ExtendInfo = {};
type User = BasicInfo & ExtendInfo;

// userId是不是已经存在

// 新增一个用户
export async function add(user: BasicInfo): Promise<void> {
  let client = await getMongoClient();
  let userId: string = user.userId;

  let collection = client.db(config.dbName).collection("user");
  await collection.insertOne(user);
}

// 更新用户信息
export async function update(
  userId: string,
  info: Partial<ExtendInfo>
): Promise<void> {
  let client = await getMongoClient();
  let collection = client.db(config.dbName).collection("user");
  let result = await collection.updateOne({ userId }, { $set: info });
}

// 获取用户的信息
export async function find(userId: string): Promise<User> {
  let rst: User = undefined;

  let client = await getMongoClient();
  let collection = client.db(config.dbName).collection("user");
  let data = await collection.findOne({ userId });

  rst = data;
  return rst;
}
