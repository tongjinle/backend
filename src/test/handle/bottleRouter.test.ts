import assert = require("assert");
import { getMongoClient, closeMongoClient } from "../../getMongoClient";
import { MongoClient, Collection } from "mongodb";
import config from "../../config";
import axios, { AxiosInstance } from "axios";
import errs from "../../errCode";
import { closeRedisClient, getRedisClient } from "../../getRedisClient";
import { IHandyRedis } from "handy-redis";

describe("bottle router", async function() {
  let request: AxiosInstance;
  let bareRequest: AxiosInstance;
  let mongo: MongoClient;
  let redis: IHandyRedis;

  const TOKEN: string = "hash123456789";
  before(async function() {
    request = axios.create({
      baseURL: `${config.protocol}://${config.host}:${config.port}`,
      headers: {
        token: TOKEN
      }
    });
    bareRequest = axios.create({
      baseURL: `${config.protocol}://${config.host}:${config.port}`
    });

    mongo = await getMongoClient();
    redis = await getRedisClient();
  });

  beforeEach(async function() {
    // 清理所有数据
    await Promise.all(
      ["bottle", "log", "user"].map(coName => {
        return mongo
          .db(config.dbName)
          .collection(coName)
          .deleteMany({});
      })
    );

    await redis.flushall();

    // 增加一个默认用户

    await mongo
      .db(config.dbName)
      .collection("user")
      .insertOne({ token: TOKEN, coin: 1000 });

    // 增加瓶子
    await mongo
      .db(config.dbName)
      .collection("bottle")
      .insertMany([
        {
          id: "1",
          url: "girl1.zip",
          price: 10000,
          password: "bottle1",
          isFrozen: false
        },
        {
          id: "2",
          url: "girl2.zip",
          price: 20,
          password: "bottle2",
          isFrozen: false
        }
      ]);
  });

  afterEach(async function() {});

  after(async function() {
    await closeMongoClient();
    await closeRedisClient();
  });

  // fetch需要token
  it("fetch-fail", async function() {
    let res = await bareRequest.post("/bottle/fetch");
    assert(res.data.code === errs.common.invalidToken.code);
  });

  // 第一次肯定是获取到金币
  it("fetch-coin", async function() {
    let res = await request.post("/bottle/fetch");
    assert(res.data.code === 0 && res.data.type === "coin");
    let data = await mongo
      .db(config.dbName)
      .collection("user")
      .findOne({ token: TOKEN });
    assert(data.coin === 1000 + res.data.coin);
  });

  // 第二次肯定是抓到瓶子
  it("fetch-resource", async function() {
    this.timeout(10 * 1000);
    await request.post("/bottle/fetch");
    let res = await request.post("/bottle/fetch");
    assert(res.data.type === "resource");
  });

  // 购买瓶子的密码-不够money
  it("password-not enough coin", async function() {
    let res = await request.post("/bottle/password", { id: "1" });
    assert(res.data.code === errs.user.notEnoughCoin.code);
  });

  // 购买瓶子的密码-成功
  // id为"2",密码bottle2,价格20
  it("password-success", async function() {
    let res = await request.post("/bottle/password", { id: "2" });
    assert(res.data.password === "bottle2");
    let data = await mongo
      .db(config.dbName)
      .collection("user")
      .findOne({ token: TOKEN });
    assert(data.coin === 1000 - 20);
  });
});
