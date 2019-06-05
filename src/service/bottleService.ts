import * as md5 from "md5";
import getMongoClient from "../getMongoClient";
import getRedisClient from "../getRedisClient";
import config from "../config";

let dbName = config.dbName;

type Bottle = {
  id?: string;
  type: "resource" | "coin";
  // 预览
  preview?: string[];
  // 资源链接
  url?: string;
  // 价格
  coin: number;
};
const cacheCount: number = 1000;

export async function fetch(token: string, time: Date): Promise<Bottle> {
  let rst: Bottle;
  let redis = await getRedisClient();
  let mongo = await getMongoClient();

  await cache();

  // 今天是否挖到过金币
  let year = time.getFullYear();
  let month = time.getMonth();
  let date = time.getDate();

  if (!(await isFetchCoin(token, year, month, date))) {
    let coin: number =
      Math.floor(Math.random() * (config.fetchCoinMax - config.fetchCoinMin)) +
      config.fetchCoinMin;
    rst = {
      type: "coin",
      coin
    };
    await logFetchCoin(token, coin, time);
  } else {
    let count = 20;
    while (count--) {
      let id = await redis.srandmember("bottle");
      if (!(await isSameResource(token, id))) {
        let item = JSON.parse(await redis.get("bottle#" + id));
        rst = {
          type: "resource",
          id,
          preview: item.preview,
          url: item.url,
          coin: item.coin
        };
        await logFetchResource(token, id, time);
      }
    }
  }

  return rst;
}

export async function password(id: string): Promise<string> {
  let rst: string;

  let mongo = await getMongoClient();
  let data = await mongo
    .db(dbName)
    .collection("bottle")
    .findOne({ id });

  if (data) {
    rst = data.password;
  }

  return rst;
}

async function cache() {
  let redis = await getRedisClient();
  let mongo = await getMongoClient();

  // 缓存数据
  if (!(await redis.smembers("bottle"))) {
    let co = await mongo.db(dbName).collection("bottle");

    let query = { isFrozen: false };
    let count = await co.countDocuments(query);
    let maxStart = Math.max(count - cacheCount, 0);
    let start = Math.floor(Math.random() * maxStart);
    let data = await co
      .find(query)
      .skip(start)
      .limit(cacheCount)
      .toArray();

    for (let i = 0; i < data.length; i++) {
      const di = data[i];
      await redis.sadd("bottle", di.id);
      await redis.set("bottle#" + di.id, JSON.stringify(di));
    }
  }
}

// 今天是否已经挖到了金币
async function isFetchCoin(
  token: string,
  year: number,
  month: number,
  date: number
): Promise<boolean> {
  let rst: boolean;
  let mongo = await getMongoClient();
  let co = mongo.db(dbName).collection("log");

  rst = !!(await co.findOne({ year, month, date, token, type: "coin" }));
  return rst;
}

// 记录某天已经挖到了金币
async function logFetchCoin(
  token: string,
  coin: number,
  time: Date
): Promise<void> {
  let year = time.getFullYear();
  let month = time.getMonth();
  let date = time.getDate();
  let mongo = await getMongoClient();
  let co = mongo.db(dbName).collection("log");
  await co.insertOne({
    type: "coin",
    year,
    month,
    date,
    coin,
    token,
    timestamp: time.getTime()
  });
}

// 是不是已经挖到了的资源
async function isSameResource(token: string, id: string): Promise<boolean> {
  let rst: boolean;
  let mongo = await getMongoClient();
  let co = mongo.db(dbName).collection("log");

  rst = !!(await co.findOne({
    type: "resource",
    token,
    id
  }));

  return rst;
}

// 记录挖到的资源
async function logFetchResource(
  token: string,
  id: string,
  time: Date
): Promise<void> {
  let mongo = await getMongoClient();
  let co = mongo.db(dbName).collection("log");

  await co.insertOne({
    type: "resource",
    token,
    id,
    timestamp: time.getTime()
  });
}
