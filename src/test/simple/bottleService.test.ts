import assert = require("assert");
import * as noticeService from "../../service/noticeService";
import * as bottleService from "../../service/bottleService";
import { MongoClient } from "mongodb";
import { getMongoClient, closeMongoClient } from "../../getMongoClient";
import config from "../../config";
import { beforeEach } from "mocha";
import { ICreateHandyClient, IHandyRedis } from "handy-redis";
import getRedisClient from "../../getRedisClient";

let dbName = config.dbName;

describe("bottle service", () => {
  let mongo: MongoClient;
  let redis: IHandyRedis;
  before(async function() {
    mongo = await getMongoClient();
    redis = await getRedisClient();
  });

  beforeEach(async function() {
    await Promise.all(
      ["bottle", "log"].map(coName => {
        return mongo
          .db(dbName)
          .collection(coName)
          .deleteMany({});
      })
    );

    await redis.flushall();

    // 插入数据
    let count = 2000;
    let arr = [];
    for (let i = 0; i < count; i++) {
      let item = {
        id: i.toString(),
        preview: ["prev" + i + "_1", "prev" + i + "_2"],
        url: "http://www.resource.com/" + i.toString(),
        coin: Math.floor(10 + Math.random() * 90),
        password: "password" + i,
        isFrozen: false
      };
      arr.push(item);
    }
    await mongo
      .db(dbName)
      .collection("bottle")
      .insertMany(arr);
  });

  after(async function() {
    await closeMongoClient();
    await redis.redis.quit();
  });

  // tong第一次fetch拿到金币
  // tong第二次fetch到瓶子
  // jin第一次fetch到金币
  it("fetch", async function() {
    this.timeout(10 * 1000);
    let tong = "tong";
    let jin = "jin";
    {
      let bottle = await bottleService.fetch(tong, new Date(2000, 0, 1));
      assert(bottle.type === "coin" && bottle.coin > 0);
    }

    {
      let bottle = await bottleService.fetch(tong, new Date(2000, 0, 1));
      assert(bottle.type === "resource" && bottle.price !== undefined);
    }

    {
      let bottle = await bottleService.fetch(jin, new Date(2000, 0, 1));
      assert(bottle.type === "coin" && bottle.coin > 0);
    }
  });

  it("password", async function() {
    this.timeout(10 * 1000);

    let bottle = await mongo
      .db(dbName)
      .collection("bottle")
      .findOne({ isFrozen: false });
    let password = await bottleService.password(bottle.id);
    assert(password !== undefined);
  });
});
