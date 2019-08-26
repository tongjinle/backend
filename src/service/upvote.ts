import { getMongoClient, getCollection } from "../mongo";
import config from "../config";

// 是否已经点赞
export async function isUpvoted(
  userId: string,
  diaryId: string
): Promise<boolean> {
  let rst: boolean;

  let mongo = await getMongoClient();
  let collUpvote = await getCollection("upvote");
  rst = !!(await collUpvote.findOne({ diaryId, userId }));

  return rst;
}

// 点赞
export async function upvote(userId: string, diaryId: string): Promise<void> {
  let mongo = await getMongoClient();
  let collUpvote = await getCollection("upvote");
  let collDiary = await getCollection("diary");

  // upvote的记录
  await collUpvote.insertOne({ diaryId, userId });

  // 给日记加1
  await collDiary.updateOne({ diaryId }, { $inc: { upvote: 1 } });
}
