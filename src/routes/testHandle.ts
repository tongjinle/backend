import * as express from "express";
import Database from "../db";
import getMongoClient from "../getMongoClient";
import config from "../config";

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

  app.get("/test/recover/", async (req, res) => {
    if (process.env.NODE_ENV !== "test") {
      res.end("only in TEST enviroment");
      return;
    }

    console.log(config.connectStr, config.dbName);

    let client = await getMongoClient();
    await client.connect();
    let users = client.db(config.dbName).collection("user");
    let photos = client.db(config.dbName).collection("photo");

    await users.deleteMany({});
    await photos.deleteMany({});

    await users.insertMany([
      { userId: "tongyan", nickname: "童颜" },
      { userId: "qianqian", nickname: "浅浅" }
    ]);

    await photos.insertMany([
      {
        id: "1",
        score: 100,
        url:
          "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E7%AB%A5%E9%A2%9C/080942a0fee28fa6bbc1be6790718757.jpg",
        nickname: "童颜",
        userId: "tongyan",
        logoUrl:
          "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E7%AB%A5%E9%A2%9C/080942a0fee28fa6bbc1be6790718757.jpg"
      },
      {
        id: "2",
        score: 90,
        url:
          "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E7%AB%A5%E9%A2%9C/19a560688838c9696d08b4016ac65906.jpg",
        nickname: "童颜",
        userId: "tongyan",
        logoUrl:
          "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E7%AB%A5%E9%A2%9C/19a560688838c9696d08b4016ac65906.jpg"
      },
      {
        id: "3",
        score: 70,
        url:
          "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E6%B5%85%E6%B5%85/0bafca06466c9de2c366ed21f10d8b44.jpg",
        nickname: "浅浅",
        userId: "qianqian",
        logoUrl:
          "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E6%B5%85%E6%B5%85/0bafca06466c9de2c366ed21f10d8b44.jpg"
      },

      {
        id: "4",
        score: 70,
        url:
          "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E5%B0%8F%E9%B9%BF%E8%B1%AC%E6%AF%94/169d8540e196aac24c6b51a3083acae8.jpg",
        nickname: "小鹿猪比",
        userId: "xiaoluzhubi",
        logoUrl:
          "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E5%B0%8F%E9%B9%BF%E8%B1%AC%E6%AF%94/169d8540e196aac24c6b51a3083acae8.jpg"
      },
      {
        id: "5",
        score: 90,
        url:
          "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E5%B0%8F%E9%B9%BF%E8%B1%AC%E6%AF%94/278a0f74b1ff35f9b761d0f67bcb6a24.jpg",
        nickname: "小鹿猪比",
        userId: "xiaoluzhubi",
        logoUrl:
          "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E5%B0%8F%E9%B9%BF%E8%B1%AC%E6%AF%94/278a0f74b1ff35f9b761d0f67bcb6a24.jpg"
      },
      {
        id: "6",
        score: 80,
        url:
          "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E5%B0%8F%E9%B9%BF%E8%B1%AC%E6%AF%94/034b8d45c2140f1a4697cf1d9c4b4a34.jpg",
        nickname: "小鹿猪比",
        userId: "xiaoluzhubi",
        logoUrl:
          "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E5%B0%8F%E9%B9%BF%E8%B1%AC%E6%AF%94/034b8d45c2140f1a4697cf1d9c4b4a34.jpg"
      },
      {
        id: "7",
        score: 40,
        url:
          "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E5%B0%8F%E9%B9%BF%E8%B1%AC%E6%AF%94/169d8540e196aac24c6b51a3083acae8.jpg",
        nickname: "小鹿猪比",
        userId: "xiaoluzhubi",
        logoUrl:
          "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E5%B0%8F%E9%B9%BF%E8%B1%AC%E6%AF%94/169d8540e196aac24c6b51a3083acae8.jpg"
      }
    ]);

    await client.close();
    res.end("recover done");
  });
}
