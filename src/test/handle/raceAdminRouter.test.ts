import assert = require("assert");
import { AxiosInstance } from "axios";
import { ChildProcess } from "child_process";
import { Collection, MongoClient } from "mongodb";
import { closeMongoClient, dropDatabase, getCollection } from "../../mongo";
import * as helper from "../helper";

describe("race admin router", async function() {
  let request: AxiosInstance;
  let client: MongoClient;
  let photos: Collection;
  let collRace: Collection;
  let worker: ChildProcess;

  this.timeout(30 * 1000);
  before(async function() {
    worker = await helper.startApp();

    collRace = await getCollection("race");
  });

  beforeEach(async function() {
    await dropDatabase();
    request = await helper.createAdminRequest();
    // await Promise.all([collRace.deleteMany({})]);
  });

  after(async function() {
    await helper.closeApp(worker);
    await closeMongoClient();
  });

  // 分享记录
  // 1 可以记录
  // 2 第二次请求记录的时候,会通知已经记录过了
  it("add", async function() {
    {
      let { data } = await request.post("/admin/race/add", {
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
      await request.post("/admin/race/add", {
        name: "seed",
        days: 7,
        postUrls: []
      });
      await collRace.updateOne({ name: "seed" }, { $set: { status: "race" } });
      let { data } = await request.post("/admin/race/remove", {
        name: "seed"
      });
      assert(data.code !== 0);
    }

    {
      await collRace.updateOne(
        { name: "seed" },
        { $set: { status: "prepare" } }
      );
      let { data } = await request.post("/admin/race/remove", {
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
      let { data } = await request.post("/admin/race/start", {
        name: "seed2"
      });
      assert(data.code !== 0);
    }

    // 比赛状态已经为gameover
    {
      await request.post("/admin/race/add", {
        name: "seed",
        days: 7,
        postUrls: []
      });

      await collRace.updateOne(
        { name: "seed" },
        { $set: { status: "gameover" } }
      );

      let { data } = await request.post("/admin/race/start", {
        name: "seed"
      });
      assert(data.code !== 0);
    }
    {
      await collRace.updateOne(
        { name: "seed" },
        { $set: { status: "prepare" } }
      );
      let { data } = await request.post("/admin/race/start", {
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
