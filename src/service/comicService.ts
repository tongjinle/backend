import getMongoClient from "../getMongoClient";

// 获取漫画目录
type IComic = { title: string; count: number };
export async function getComicList(): Promise<IComic[]> {
  let rst: IComic[] = [];
  let client = await getMongoClient();
  await client.connect();

  let data = await client
    .db("tea")
    .collection("comic")
    .aggregate([{ $group: { _id: "$title", count: { $sum: 1 } } }])
    .toArray();

  rst = data.map(n => {
    let title = n._id;
    let count = n.count;
    return { title, count };
  });
  await client.close();
  return rst;
}

// 获取漫画书页
type IContent = { index: number; url: string };
export async function getContent(title: string): Promise<IContent[]> {
  let rst: IContent[] = [];
  let client = await getMongoClient();
  await client.connect();

  let data = await client
    .db("tea")
    .collection("comic")
    .find({ title })
    .toArray();
  rst = data.map(n => {
    let name = n.name;
    let index = name.split("-")[0];
    let url = n.url;
    return { index, url };
  });
  await client.close();

  return rst;
}
