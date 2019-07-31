import { getCollection } from "../getMongoClient";
export type Gender = "male" | "female";

// 基本用户信息
// 确认了不能修改
export type BasicInfo = {
  userId: string;
  nickname: string;
  gender: Gender;
};
// 扩展用户信息(可以修改)
export type ExtendInfo = {
  coin: number;
  follow: number;
};
export type User = BasicInfo & ExtendInfo;

// 是否可以新增用户
// userId是不是已经存在
export async function canAdd(userId: string): Promise<boolean> {
  let rst: boolean;

  let collection = await getCollection("user");
  let user = await collection.findOne({ userId });
  if (!!user) {
    return false;
  }

  rst = true;
  return rst;
}

// 新增一个用户
export async function add(user: BasicInfo): Promise<void> {
  let collection = await getCollection("user");
  await collection.insertOne(user);
}

// 更新用户信息
export async function update(
  userId: string,
  info: Partial<ExtendInfo>
): Promise<void> {
  let collection = await getCollection("user");
  let result = await collection.updateOne({ userId }, { $set: info });
}

// 获取用户的信息
export async function find(userId: string): Promise<User> {
  let rst: User = undefined;

  let collection = await getCollection("user");
  let data = await collection.findOne({ userId });

  rst = data;
  return rst;
}
