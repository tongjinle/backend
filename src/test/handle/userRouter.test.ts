import assert = require("assert");
import getMongoClient from "../../getMongoClient";
import { MongoClient, Collection } from "mongodb";
import config from "../../config";
import axios, { AxiosInstance } from "axios";
import errs from "../../errCode";
import * as userService from "../../service/user";

describe("user router", async function() {
  let request: AxiosInstance;
  let bareRequest: AxiosInstance;
  let client: MongoClient;
  let photos: Collection;
  let users: Collection;
  before(async function() {
    request = axios.create({
      baseURL: `${config.protocol}://${config.host}:${config.port}`,
      headers: {
        userId: "sannian",
        token: await userService.getToken("sannian")
      }
    });
    bareRequest = axios.create({
      baseURL: `${config.protocol}://${config.host}:${config.port}`
    });

    client = await getMongoClient();
    await client.connect();
    photos = client.db(config.dbName).collection("photo");
    users = client.db(config.dbName).collection("user");
  });

  beforeEach(async function() {
    // 清理所有数据
    await photos.deleteMany({});
    await users.deleteMany({});

    await users.insertMany([
      { userId: "sannian", nickname: "三年" },
      { userId: "zst", nickname: "周淑婷" }
    ]);
    await photos.insertMany([
      { id: "1", score: 100, url: "url1", nickname: "三年", userId: "sannian" },
      { id: "2", score: 90, url: "url2", nickname: "三年", userId: "sannian" },
      { id: "3", score: 90, url: "url2", nickname: "周淑婷", userId: "zst" }
    ]);
  });

  afterEach(async function() {});

  after(async function() {
    await client.close();
  });

  it("check user role", async function() {
    {
      let res = await bareRequest.get("/user");
      assert(res.data.code === errs.common.invalidParams.code);
    }

    {
      let res = await bareRequest.get("/user", {
        headers: {
          userId: "tongjinle",
          token: "123"
        }
      });
      assert(res.data.code === errs.common.wrongToken.code);
    }
  });

  it("update", async function() {
    let res = await request.post("/user/update/", {
      nickname: "三年是傻子"
    });

    let data = await users.findOne({ userId: "sannian" });

    assert(data.nickname === "三年是傻子");
    assert(res.data.code === 0);
  });

  xit("score", async function() {
    this.timeout(30 * 1000);
    let res = await request.post("/user/score/", {
      url:
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/test/faceScore/034b8d45c2140f1a4697cf1d9c4b4a34.jpg"
    });

    assert(res.data.code === 0 && res.data.score !== -1);
  });

  it("history", async function() {
    let res = await request.get("/user/history/");
    assert(res.data.code === 0 && res.data.list.length === 2);
  });

  // 删除不是我的照片
  it("remove.fail", async function() {
    let res = await request.post("/user/remove/", { id: "3" });
    assert(res.data.code === errs.photo.notOwner.code);
  });

  //  删除我的照片
  it("remove.success", async function() {
    let res = await request.post("/user/remove/", { id: "1" });
    assert(res.data.code === 0);

    let data = await photos.find({ userId: "sannian" }).toArray();
    assert(data.length === 1);
  });
});
