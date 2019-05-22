import getMongoClient from "../getMongoClient";

type Photo = {
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
    .db("cute")
    .collection("photo")
    .find({})
    .sort({ score: 1 })
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

export async function search(id: string): Promise<Photo> {
  let rst: Photo;
  let client = await getMongoClient();
  await client.connect();

  let data = await client
    .db("cute")
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
