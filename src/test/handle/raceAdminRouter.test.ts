import assert = require("assert");
import { getMongoClient, closeMongoClient, getCollection } from "../../mongo";
import { MongoClient, Collection } from "mongodb";
import config from "../../config";
import axios, { AxiosInstance } from "axios";
import errs from "../../errCode";
import * as userService from "../../service/user";
import { fork, ChildProcess } from "child_process";
import * as path from "path";
import utils from "../../utils";
import * as protocol from "../../protocol";

describe("race admin router", async function() {
  let request: AxiosInstance;
  let bareRequest: AxiosInstance;
  let client: MongoClient;
  let photos: Collection;
  let collRace: Collection;
  let worker: ChildProcess;

  before(async function() {
    this.timeout(30 * 1000);
    let file = path.resolve(__dirname, "../../app.js");
    console.log(file);
    worker = fork(file);
    await new Promise(resolve => {
      setTimeout(resolve, 3 * 1000);
    });

    request = axios.create({
      baseURL: `${config.protocol}://${config.host}:${config.port}`,
      headers: {
        userId: "sannian",
        token: await utils.getUserToken("sannian")
      }
    });
    bareRequest = axios.create({
      baseURL: `${config.protocol}://${config.host}:${config.port}`
    });

    collRace = await getCollection("race");
  });

  beforeEach(async function() {
    await Promise.all([collRace.deleteMany({})]);
  });

  after(async function() {
    worker.kill();
    await closeMongoClient();
  });

  // 分享记录
  // 1 可以记录
  // 2 第二次请求记录的时候,会通知已经记录过了
  it("add", async function() {
    {
      let { data } = await bareRequest.post("/race/admin/add", {
        name: "seed",
        days: 7,
        postUrls: []
      });
      assert(data.code === 0);
    }

    {
      let data = await collRace.findOne({
        name: "seed"
      });
      assert(data);
    }
  });

  // 删除比赛
  it("remove", async function() {
    {
      await bareRequest.post("/race/admin/add", {
        name: "seed",
        days: 7,
        postUrls: []
      });
      await collRace.updateOne({ name: "seed" }, { $set: { status: "race" } });
      let { data } = await bareRequest.post("/race/admin/remove", {
        name: "seed"
      });
      assert(data.code !== 0);
    }

    {
      await collRace.updateOne(
        { name: "seed" },
        { $set: { status: "prepare" } }
      );
      let { data } = await bareRequest.post("/race/admin/remove", {
        name: "seed"
      });
      assert(data.code === 0);
      {
        let data = await collRace.findOne({ name: "seed" });
        assert(!data);
      }
    }
  });

  it("start", async function() {
    // 不存在的比赛不能start
    {
      let { data } = await bareRequest.post("/race/admin/start", {
        name: "seed2"
      });
      assert(data.code !== 0);
    }

    // 比赛状态已经为gameover
    {
      await bareRequest.post("/race/admin/add", {
        name: "seed",
        days: 7,
        postUrls: []
      });

      await collRace.updateOne(
        { name: "seed" },
        { $set: { status: "gameover" } }
      );

      let { data } = await bareRequest.post("/race/admin/start", {
        name: "seed"
      });
      assert(data.code !== 0);
    }
    {
      await collRace.updateOne(
        { name: "seed" },
        { $set: { status: "prepare" } }
      );
      let { data } = await bareRequest.post("/race/admin/start", {
        name: "seed"
      });
      assert(data.code === 0);

      {
        let data = await collRace.findOne({ name: "seed" });
        assert(data && data.status === "race");
      }
    }
  });
});
