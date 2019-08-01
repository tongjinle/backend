// 关注
import { getMongoClient } from "../getMongoClient";
import config from "../config";
import * as userService from "./user";
import { UserInfo } from "./user";

// 是否已经关注
export async function isFollowed(
  userId: string,
  girlId: string
): Promise<boolean> {
  let rst: boolean;
  let mongo = await getMongoClient();
  rst = !!(await mongo
    .db(config.dbName)
    .collection("follow")
    .findOne({ userId, girlId }));
  return rst;
}

// 关注
export async function follow(userId: string, girlId: string): Promise<void> {
  let mongo = await getMongoClient();

  // 记录
  await mongo
    .db(config.dbName)
    .collection("follow")
    .insertOne({ userId, girlId });

  // 修改用户的记录信息
  await mongo
    .db(config.dbName)
    .collection("user")
    .updateOne({ userId: girlId }, { $inc: { follow: 1 } });
}

// 取消关注
export async function unfollow(userId: string, girlId: string): Promise<void> {
  let mongo = await getMongoClient();

  // 记录
  await mongo
    .db(config.dbName)
    .collection("follow")
    .deleteOne({ userId, girlId });

  // 修改用户的记录信息
  await mongo
    .db(config.dbName)
    .collection("user")
    .updateOne({ userId: girlId }, { $inc: { follow: 1 } });
}

// 关注列表
export async function list(userId: string): Promise<UserInfo[]> {
  let rst: UserInfo[] = [];
  let mongo = await getMongoClient();
  let data = await mongo
    .db(config.dbName)
    .collection("follow")
    .find({ userId })
    .toArray();

  let girlIds: string[] = data.map(n => n.girlId);

  let girls: UserInfo[] = await Promise.all(
    girlIds.map(id => userService.find(id))
  );
  rst = girls;

  return rst;
}
