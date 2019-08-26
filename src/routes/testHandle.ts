import * as express from "express";
import config from "../config";
import { getCollection, getMongoClient } from "../mongo";
import recover from "./recover";

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
      .db(config.mongo.dbName)
      .collection("test")
      .insertOne({ ts });
    let data = await mongo
      .db(config.mongo.dbName)
      .collection("test")
      .findOne({ ts });
    res.end("db test:" + data.ts);
  });

  app.get("/test/recover", async (req, res) => {
    if (process.env.NODE_ENV !== "dev") {
      res.end("only in TEST enviroment");
      return;
    }

    await recover();

    res.end("recover done");
  });
}
