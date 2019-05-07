import db from "../db";

type picInfo = { url: string; name: string; timestamp: number };
export async function picList(
  name: string,
  pageIndex: number,
  pageSize: number
): Promise<picInfo[]> {
  let rst: picInfo[];
  let client = await db.getIns();
  let data = await client
    .getCollection("twitter")
    // .find({})
    .find({ ext: name })
    .sort({ timestamp: -1 })
    .skip(pageIndex * pageSize)
    .limit(pageSize)
    .toArray();
  rst = data.map(n => {
    return {
      id: n.name,
      name,
      timestamp: n.timestamp,
      url: n.remoteUrl
    };
  });
  return rst;
}
