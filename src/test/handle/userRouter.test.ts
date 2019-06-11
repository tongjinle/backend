import assert = require("assert");
import { getMongoClient, closeMongoClient } from "../../getMongoClient";
import { MongoClient, Collection } from "mongodb";
import config from "../../config";
import axios, { AxiosInstance } from "axios";
import errs from "../../errCode";
import * as userService from "../../service/userService";
import { closeRedisClient } from "../../getRedisClient";

describe("user router", async function() {
  let request: AxiosInstance;
  let bareRequest: AxiosInstance;
  let mongo: MongoClient;

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

    await mongo
      .db(config.dbName)
      .collection("user")
      .insertOne({ token: TOKEN, coin: 1000 });
  });

  afterEach(async function() {});

  after(async function() {
    await closeMongoClient();
    await closeRedisClient();
  });

  it("reg", async function() {
    let res = await bareRequest.post("/guest/reg");
    assert(res.data.token !== undefined);
  });

  // 使用mock的token
  it("coin", async function() {
    let res = await request.get("/user/coin");
    assert(res.data.coin === 1000);
  });

  // 提交贡献(失败,没有提交url)
  it("contribute-fail", async function() {
    let res = await request.post("/user/contribute");
    assert(res.data.code === errs.common.invalidParams.code);
  });

  // 提交贡献
  it("contribute", async function() {
    let res = await request.post("/user/contribute", { url: "girl.zip" });
    assert(res.data.code === 0);
    let data = await mongo
      .db(config.dbName)
      .collection("contribute")
      .findOne({ token: TOKEN });
    assert(data.url === "girl.zip");
  });
});
