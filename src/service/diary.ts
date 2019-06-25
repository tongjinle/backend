// 颜值日记
import { getMongoClient } from "../getMongoClient";
import config from "../config";

// 媒体类型
export type MediaType = "photo" | "video" | "audio";
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
  isSale: boolean;
  // 时间
  time: Date;
};
// 新增日记
export async function add(diary: Diary): Promise<void> {
  let mongo = await getMongoClient();
  await mongo
    .db(config.dbName)
    .collection("diary")
    .insertOne(diary);
}

// 寻找日记
export async function find(diaryId: string): Promise<Diary> {
  let rst: Diary;

  let mongo = await getMongoClient();
  let data = await mongo
    .db(config.dbName)
    .collection("diary")
    .findOne({ id: diaryId });
  rst = data;
  return rst;
}

// 删除日记
export async function remove(diaryId: string): Promise<void> {
  let mongo = await getMongoClient();
  await mongo
    .db(config.dbName)
    .collection("diary")
    .deleteOne({ id: diaryId });
}

// 购买日记
export async function buy(userId: string, diaryId: string): Promise<void> {
  let mongo = await getMongoClient();
  await mongo
    .db(config.dbName)
    .collection("diarySale")
    .insertOne({ userId, diaryId, time: new Date() });
}

// 是否购买了日记
export async function isBuyed(
  userId: string,
  diaryId: string
): Promise<boolean> {
  let rst: boolean;

  let mongo = await getMongoClient();
  rst = !!(await mongo
    .db(config.dbName)
    .collection("diarySale")
    .findOne({ userId, diaryId }));

  return rst;
}
