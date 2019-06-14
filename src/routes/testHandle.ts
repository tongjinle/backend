import * as express from "express";
import Database from "../db";
import { getMongoClient } from "../getMongoClient";
import { getRedisClient } from "../getRedisClient";
import config from "../config";
import conf from "../config";
import { url } from "inspector";

export default function handle(app: express.Express) {
  // 测试
  app.get("/test", async (req, res) => {
    res.end("hello world");
  });

  app.post("/testPost", async (req, res) => {
    console.log("testPost");
    console.log(req.body);
    res.end("testPost");
  });

  app.get("/test/db", async (req, res) => {
    let db = await Database.getIns();
    let ts = Date.now();
    await db.getCollection("test").insertOne({ ts });
    let data = await db.getCollection("test").findOne({ ts });
    res.end("db test:" + data.ts);
  });

  app.get("/test/mock", async (req, res) => {
    let mongo = await getMongoClient();
    let redis = await getRedisClient();

    // clear
    let arr = ["user", "log", "bottle"].map(coName => {
      return mongo
        .db(config.dbName)
        .collection(coName)
        .deleteMany({});
    });
    await Promise.all(arr);

    await redis.flushall();

    // insert
    mongo
      .db(config.dbName)
      .collection("user")
      .insertMany([
        { token: "tea", coin: 10000 },
        { token: "sannian", coin: 0 }
      ]);

    let bottles = [];
    for (let i = 0; i < 100; i++) {
      bottles.push({
        id: i.toString(),
        preview: [
          "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/童颜/cb9ce157e9e5141085dc9d9fe7bcb7c3.jpg",
          "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/童颜/b28bd8774ab88ad907070772e2d013b3.jpg"
        ],
        url:
          "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/童颜/badad837acdc4aed26c4778534f6eb2b.jpg",
        coin: i + 1,
        password: "password" + i
      });
    }
    mongo
      .db(config.dbName)
      .collection("bottle")
      .insertMany(bottles);
    res.end("mock done");
  });
}
