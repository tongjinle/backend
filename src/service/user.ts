import { getCollection } from "../getMongoClient";
export type Gender = "male" | "female" | "unknow";

// 基本用户信息
// 确认了不能修改
export type BasicInfo = {
  userId: string;
  nickname: string;
  logoUrl: string;
  gender: Gender;
  city: string;
};
// 扩展用户信息(可以修改)
export type ExtendInfo = {
  birthYear: number;
  bgUrl: string;
  /**
   * 代币
   */
  coin: number;
  follow: number;
  // 被打榜的总人数
  beUpvoted: number;
  // 被打榜的总代币
  beUpvotedCoin: number;
  // 打榜过的总人数
  upvoted: number;
  // 打榜过的总代币
  upvotedCoin: number;
};
export type UserInfo = BasicInfo & ExtendInfo;

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
  let ext: ExtendInfo = {
    birthYear: -1,
    bgUrl: undefined,
    coin: 0,
    follow: 0,
    upvoted: 0,
    upvotedCoin: 0,
    beUpvoted: 0,
    beUpvotedCoin: 0
  };
  let fullUser = { ...user, ...ext };
  await collection.insertOne(fullUser);
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
export async function find(userId: string): Promise<UserInfo> {
  let rst: UserInfo = undefined;

  let collection = await getCollection("user");
  let data = await collection.findOne({ userId });

  rst = data;
  return rst;
}

/**
 * 更新用户代币
 * @param userId 用户id
 * @param coin 代币增量
 */
export async function updateCoin(userId: string, coin: number): Promise<void> {
  let coll = await getCollection("user");
  await coll.updateOne({ userId }, { $inc: { coin } });
}

/**
 * 更新用户打榜信息(打榜总信息)
 * @param userId 用户id
 * @param coin 代币增量
 */
export async function updateUpvote(
  userId: string,
  upvoterId: string,
  coin: number
): Promise<void> {
  let coll = await getCollection("user");
  await coll.updateOne(
    { userId },
    { $inc: { beUpvoted: 1, beUpvoteCoin: coin } }
  );

  await coll.updateOne(
    { userId: upvoterId },
    {
      $ins: {
        upvoted: 1,
        upvotedCoin: coin
      }
    }
  );
}
