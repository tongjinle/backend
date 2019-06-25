// 热度
import { getMongoClient } from "../getMongoClient";
import config from "../config";

// 增加热度
export async function add(userId: string, hot: number): Promise<void> {
  let mongo = await getMongoClient();
  await mongo
    .db(config.dbName)
    .collection("user")
    .updateOne({ userId }, { $inc: { hot } });
}
