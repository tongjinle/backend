import {
  getCollection,
  getMongoClient,
  closeMongoClient
} from "./getMongoClient";
/**
 * 为数据库建立索引
 */
async function createMongoIndex() {
  // 日记
  {
    let coll = await getCollection("diary");
    await coll.createIndex({ userId: 1 });
  }

  // 官方通知
  {
    let coll = await getCollection("notice");
    await coll.createIndex({ userId: 1 });
  }

  // 参赛选手
  {
    let coll = await getCollection("racePlayer");
    await coll.createIndex({ raceName: 1, upvote: 1 });
  }

  // 金主
  {
    let coll = await getCollection("raceUpvoter");
    await coll.createIndex({ raceName: 1, coin: 1 });
  }

  // 分享
  {
    let coll = await getCollection("share");
    await coll.createIndex(
      { userId: 1, year: 1, month: 1, day: 1 },
      { unique: true }
    );
  }

  // 分享获取新用户
  {
    let coll = await getCollection("shareLink");
    await coll.createIndex({ userId: 1, sharerId: 1 }, { unique: true });
  }

  // 签到
  {
    let coll = await getCollection("sign");
    await coll.createIndex(
      { userId: 1, year: 1, month: 1, day: 1 },
      { unique: true }
    );
  }

  // 用户
  {
    let coll = await getCollection("user");
    await coll.createIndex({ userId: 1 }, { unique: true });
  }

  // 用户log
  {
    let coll = await getCollection("userLog");
    await coll.createIndex({ userId: 1 }, { unique: true });
  }
  await closeMongoClient();
}

createMongoIndex();
