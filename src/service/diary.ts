// 颜值日记
import { getMongoClient, getCollection, getObjectId } from "../getMongoClient";
import config from "../config";
import { date, func } from "@hapi/joi";
import * as userService from "./user";

// 媒体类型
export enum MediaType {
  image = "image",
  video = "video",
  audio = "audio"
}
// 日记
export type Diary = {
  id: string;
  // userId
  userId: string;
  // 远程url
  url: string;
  // 文字描述
  text: string;
  // 媒体类型
  type: MediaType;
  // 得分
  score?: number;
  // 出售
  // isSale: boolean;
  // 时间
  timestamp: number;
  // 打榜次数
  upvote: number;
  // 打榜消耗的金币
  coin: number;
};

const DIARY: string = "diary";
const DIARY_UPVOTE: string = "diaryUpvote";

/**
 * 新增日记
 * @param userId 用户id
 * @param text 日记文本
 * @param url 媒体url
 * @param type 媒体类型
 */
export async function add(
  userId: string,
  text: string,
  url: string,
  type: MediaType,
  score: number
): Promise<void> {
  let coll = await getCollection(DIARY);
  await coll.insertOne({
    userId,
    text,
    url,
    type,
    score,
    time: new Date(),
    upvote: 0,
    coin: 0
  });
}

/**
 * 寻找日记
 * @param id 日记id
 */
export async function find(id: string): Promise<Diary> {
  let rst: Diary;
  let coll = await getCollection(DIARY);
  let data = await coll.findOne({ _id: getObjectId(id) });

  rst = {
    userId: data.userId,
    id: data._id.toString(),
    text: data.text,
    url: data.url,
    type: data.type,
    score: data.score,
    timestamp: data.time.getTime(),
    upvote: data.upvote,
    coin: data.coin
  };
  return rst;
}

/**
 * 能否删除日记
 * @param id 日记id
 * @param userId 用户id
 */
export async function canRemove(id: string, userId: string): Promise<boolean> {
  let rst: boolean;

  let collDiary = await getCollection(DIARY);
  if (!(await collDiary.findOne({ _id: getObjectId(id), userId }))) {
    return false;
  }

  rst = true;
  return rst;
}

/**
 * 删除日记
 * @param id 日记id
 */
export async function remove(id: string): Promise<void> {
  let coll = await getCollection(DIARY);
  await coll.deleteOne({ _id: getObjectId(id) });
}

/**
 * 能否打榜日记
 * @param id 日记id
 * @param userId 打榜者id
 * @param coin 打榜的金币
 */
export async function canUpvote(id: string, userId: string): Promise<boolean> {
  let rst: boolean;

  let collDiary = await getCollection(DIARY);
  // 1 日记存在
  if (!(await collDiary.findOne({ _id: getObjectId(id) }))) {
    return false;
  }
  // 2 尚未打榜
  let collUpvote = await getCollection(DIARY_UPVOTE);
  if (await collUpvote.findOne({ dairyId: id, userId })) {
    return false;
  }

  // 3 打榜者有足够的打榜代币
  // 3 应该在别的代码中实现,而不是这里
  // let user = await userService.find(userId);
  // if (!(user && user.coin >= coin)) {
  //   return false;
  // }

  rst = true;
  return rst;
}

/**
 * 日记打榜
 * @param id 日记id
 * @param userId 打榜者id
 * @param coin 打榜消耗的代币
 */
export async function upvote(
  id: string,
  userId: string,
  coin: number
): Promise<void> {
  let collDiary = await getCollection(DIARY);
  let collUpvote = await getCollection(DIARY_UPVOTE);
  await collDiary.updateOne(
    { _id: getObjectId(id) },
    { $inc: { upvote: 1, coin } }
  );
  await collUpvote.insertOne({ diaryId: id, userId, coin, time: new Date() });
}

/**
 * 日记列表
 * @param userId 用户id
 */
export async function list(userId: string): Promise<Diary[]> {
  let rst: Diary[];
  let coll = await getCollection(DIARY);

  let data = await coll.find({ userId }).toArray();
  rst = data.map(n => ({
    userId: n.userId,
    id: n._id.toString(),
    text: n.text,
    url: n.url,
    type: n.type,
    score: n.score,
    timestamp: n.time.getTime(),
    upvote: n.upvote,
    coin: n.coin
  }));
  return rst;
}

/**
 * 热度最高的日记列表
 * @param limit 个数限制
 */
export async function topList(limit: number): Promise<Diary[]> {
  let rst: Diary[] = [];
  let coll = await getCollection(DIARY);
  let data = await coll
    .find({})
    .sort({ upvote: -1 })
    .limit(limit)
    .toArray();
  rst = data.map(n => ({
    userId: n.userId,
    id: n._id.toString(),
    text: n.text,
    url: n.url,
    type: n.type,
    score: n.score,
    timestamp: n.time.getTime(),
    upvote: n.upvote,
    coin: n.coin
  }));
  return rst;
}

/** 最新的日记列表 */
/**
 *
 * @param limit 个数限制
 */
export async function freshList(limit: number): Promise<Diary[]> {
  let rst: Diary[] = [];
  let coll = await getCollection(DIARY);
  let data = await coll
    .find({})
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
  rst = data.map(n => ({
    userId: n.userId,
    id: n._id.toString(),
    text: n.text,
    url: n.url,
    type: n.type,
    score: n.score,
    timestamp: n.time.getTime(),
    upvote: n.upvote,
    coin: n.coin
  }));
  return rst;
}

// 购买日记
// export async function buy(userId: string, diaryId: string): Promise<void> {
//   let mongo = await getMongoClient();
//   await mongo
//     .db(config.dbName)
//     .collection("diarySale")
//     .insertOne({ userId, diaryId, time: new Date() });
// }

// 是否购买了日记
// export async function isBuyed(
//   userId: string,
//   diaryId: string
// ): Promise<boolean> {
//   let rst: boolean;

//   let mongo = await getMongoClient();
//   rst = !!(await mongo
//     .db(config.dbName)
//     .collection("diarySale")
//     .findOne({ userId, diaryId }));

//   return rst;
// }
