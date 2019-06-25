import { getMongoClient } from "../getMongoClient";
import config from "../config";

// 是否已经点赞
export async function isUpvoted(
  userId: string,
  diaryId: string
): Promise<boolean> {
  let rst: boolean;

  let mongo = await getMongoClient();
  rst = !!(await mongo
    .db(config.dbName)
    .collection("upvote")
    .findOne({ diaryId, userId }));

  return rst;
}

// 点赞
export async function upvote(userId: string, diaryId: string): Promise<void> {
  let mongo = await getMongoClient();

  // upvote的记录
  await mongo
    .db(config.dbName)
    .collection("upvote")
    .insertOne({ diaryId, userId });

  // 给日记加1
  await mongo
    .db(config.dbName)
    .collection("diary")
    .updateOne({ diaryId }, { $inc: { upvote: 1 } });
}
