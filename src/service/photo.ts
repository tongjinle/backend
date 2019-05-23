import getMongoClient from "../getMongoClient";
import axios from "axios";
import config from "../config";
import md5 = require("md5");

export type Photo = {
  id: string;
  userId: string;
  url: string;
  score: number;
  nickname: string;
};

// 获取排行榜
export async function sort(): Promise<Photo[]> {
  let rst: Photo[] = [];
  let client = await getMongoClient();
  await client.connect();

  const limit = 10;
  let data = await client
    .db(config.dbName)
    .collection("photo")
    .find({})
    .sort({ score: -1 })
    .limit(limit)
    .toArray();

  rst = data.map(n => ({
    id: n.id,
    userId: n.userId,
    url: n.url,
    score: n.score,
    nickname: n.nickname
  }));

  await client.close();
  return rst;
}

// 查找照片
export async function search(id: string): Promise<Photo> {
  let rst: Photo;
  let client = await getMongoClient();
  await client.connect();

  let data = await client
    .db(config.dbName)
    .collection("photo")
    .findOne({ id });

  if (data) {
    rst = {
      id: data.id,
      userId: data.userId,
      url: data.url,
      score: data.score,
      nickname: data.nickname
    };
  }

  await client.close();
  return rst;
}

// 保存照片
export async function save(
  userId: string,
  url: string,
  nickname: string
): Promise<Photo> {
  let rst: Photo;

  // 评分
  let aiUrl = "https://api.puman.xyz/commonApi/ai/faceScore";
  console.log({ url });
  let score: number = 0;
  let res = await axios.post(aiUrl, { url });
  score = res.data.result;
  if (score === -1) {
    return undefined;
  }

  // 保存
  let client = await getMongoClient();
  await client.connect();
  let id: string = md5(url);
  await client
    .db(config.dbName)
    .collection("photo")
    .insertOne({ id, userId, url, score, nickname });
  await client.close();

  rst = { id, userId, nickname, url, score };
  return rst;
}

// 历史照片
export async function history(userId: string): Promise<Photo[]> {
  let rst: Photo[] = [];

  let client = await getMongoClient();
  await client.connect();

  let data = await client
    .db(config.dbName)
    .collection("photo")
    .find({ userId })
    .toArray();

  rst = data.map(n => {
    return {
      id: n.id,
      userId: n.userId,
      nickname: n.nickname,
      url: n.url,
      score: n.score
    };
  });

  await client.close();

  return rst;
}

// 删除照片
export async function remove(id: string): Promise<void> {
  let client = await getMongoClient();
  await client.connect();
  await client
    .db(config.dbName)
    .collection("photo")
    .deleteOne({ id });
  await client.close();
}

// 照片id和userId是否匹配
// userId是不是照片的主人
export async function checkOwner(userId: string, id: string): Promise<boolean> {
  let rst: boolean;

  let client = await getMongoClient();
  await client.connect();
  let flag = !!(await client
    .db(config.dbName)
    .collection("photo")
    .findOne({ userId, id }));
  await client.close();

  rst = flag;
  return rst;
}
