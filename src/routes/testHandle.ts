import * as express from "express";
import config from "../config";
import { getCollection, getMongoClient } from "../getMongoClient";

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
    let mongo = await getMongoClient();
    let ts = Date.now();
    await mongo
      .db(config.dbName)
      .collection("test")
      .insertOne({ ts });
    let data = await mongo
      .db(config.dbName)
      .collection("test")
      .findOne({ ts });
    res.end("db test:" + data.ts);
  });

  app.get("/test/recover", async (req, res) => {
    if (process.env.NODE_ENV !== "dev") {
      res.end("only in TEST enviroment");
      return;
    }

    let users = await getCollection("user");

    await users.deleteMany({});

    await users.insertMany([
      {
        userId: "tongyan",
        nickname: "童颜",
        gender: "female",
        logoUrl:
          "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E7%AB%A5%E9%A2%9C/080942a0fee28fa6bbc1be6790718757.jpg",
        city: "上海",
        birthYear: 2000,
        coin: 90
      },
      {
        userId: "qianqian",
        nickname: "浅浅",
        gender: "female",
        logoUrl:
          "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E6%B5%85%E6%B5%85/0bafca06466c9de2c366ed21f10d8b44.jpg",
        city: "北京",
        birthYear: 2001,
        coin: 100
      }
    ]);

    res.end("recover done");
  });
}
