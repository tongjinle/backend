// 关注
import { getCollection } from "../mongo";
import * as userService from "./user";
import { UserInfo } from "./user";

// 是否已经关注
export async function isFollowed(
  userId: string,
  girlId: string
): Promise<boolean> {
  let rst: boolean;
  let collFollow = await getCollection("follow");
  rst = !!(await collFollow.findOne({ userId, girlId }));
  return rst;
}

// 关注
export async function follow(userId: string, girlId: string): Promise<void> {
  let collFollow = await getCollection("follow");
  let collUser = await getCollection("user");

  // 记录
  await collFollow.insertOne({ userId, girlId });

  // 修改用户的记录信息
  await collUser.updateOne({ userId: girlId }, { $inc: { follow: 1 } });
}

// 取消关注
export async function unfollow(userId: string, girlId: string): Promise<void> {
  let collFollow = await getCollection("follow");
  let collUser = await getCollection("user");
  // 记录
  await collFollow.deleteOne({ userId, girlId });

  // 修改用户的记录信息
  await collUser.updateOne({ userId: girlId }, { $inc: { follow: 1 } });
}

// 关注列表
export async function list(userId: string): Promise<UserInfo[]> {
  let rst: UserInfo[] = [];
  let collFollow = await getCollection("follow");
  let collUser = await getCollection("user");
  let data = await collFollow.find({ userId }).toArray();

  let girlIds: string[] = data.map(n => n.girlId);

  let girls: UserInfo[] = await Promise.all(
    girlIds.map(id => userService.find(id))
  );
  rst = girls;

  return rst;
}
