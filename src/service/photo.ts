import { getMongoClient, getCollection } from "../mongo";
import md5 = require("md5");
import * as request from "request";

export type Photo = {
  id: string;
  userId: string;
  url: string;
  score: number;
  nickname: string;
  logoUrl: string;
};

// 获取排行榜
export async function sort(): Promise<Photo[]> {
  let rst: Photo[] = [];
  let collPhoto = await getCollection("photo");
  const limit = 10;
  let data = await collPhoto
    .find({})
    .sort({ score: -1 })
    .limit(limit)
    .toArray();

  rst = data.map(n => ({
    id: n.id,
    userId: n.userId,
    url: n.url,
    score: n.score,
    nickname: n.nickname,
    logoUrl: n.logoUrl
  }));

  return rst;
}

// 查找照片
export async function search(id: string): Promise<Photo> {
  let rst: Photo;
  let collPhoto = await getCollection("photo");

  let data = await collPhoto.findOne({ id });

  if (data) {
    rst = {
      id: data.id,
      userId: data.userId,
      url: data.url,
      score: data.score,
      nickname: data.nickname,
      logoUrl: data.logoUrl
    };
  }

  return rst;
}

// 保存照片
export async function save(
  userId: string,
  url: string,
  nickname: string,
  logoUrl: string
): Promise<Photo> {
  let rst: Photo;

  // 评分
  let aiUrl = "https://api.puman.xyz/commonApi/ai/faceScore";
  let score: number = 0;
  score = await new Promise(resolve => {
    request.post(aiUrl, { json: { url } }, (err, res) => {
      if (err) {
        resolve(-1);
        return;
      }
      let data = typeof res.body === "string" ? JSON.parse(res.body) : res.body;
      if (data.code === 0) {
        resolve(data.result);
      } else {
        resolve(-1);
      }
    });
  });

  // let res = await axios.post(aiUrl, { url });
  // score = res.data.result;
  // if (score === -1) {
  //   return undefined;
  // }
  console.log({ aiUrl, url, score });

  // 保存
  let collPhoto = await getCollection("photo");

  let id: string = md5(url);
  await collPhoto.insertOne({ id, userId, url, score, nickname, logoUrl });

  rst = { id, userId, nickname, url, score, logoUrl };
  return rst;
}

// 历史照片
export async function history(userId: string): Promise<Photo[]> {
  let rst: Photo[] = [];

  let collPhoto = await getCollection("photo");

  let data = await collPhoto.find({ userId }).toArray();

  rst = data.map(n => {
    return {
      id: n.id,
      userId: n.userId,
      nickname: n.nickname,
      url: n.url,
      score: n.score,
      logoUrl: n.logoUrl
    };
  });

  return rst;
}

// 删除照片
export async function remove(id: string): Promise<void> {
  let collPhoto = await getCollection("photo");

  await collPhoto.deleteOne({ id });
}

// 照片id和userId是否匹配
// userId是不是照片的主人
export async function checkOwner(userId: string, id: string): Promise<boolean> {
  let rst: boolean;

  let collPhoto = await getCollection("photo");

  let flag = !!(await collPhoto.findOne({ userId, id }));

  rst = flag;
  return rst;
}
