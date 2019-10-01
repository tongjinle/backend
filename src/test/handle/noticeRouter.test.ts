import assert = require("assert");
import { AxiosInstance } from "axios";
import { ChildProcess } from "child_process";
import { Collection } from "mongodb";
import { closeMongoClient, dropDatabase, getCollection } from "../../mongo";
import { closeRedisClient, flushDb } from "../../redis";
import * as helper from "../helper";

describe("notice router", async function() {
  let request: AxiosInstance;
  let collNotice: Collection;
  let worker: ChildProcess;

  this.timeout(30 * 1000);
  before(async function() {
    worker = await helper.startApp();

    collNotice = await getCollection("notice");
  });

  beforeEach(async function() {
    await dropDatabase();
    await flushDb();
    request = await helper.createRequest("sannian");
  });

  after(async function() {
    await helper.closeApp(worker);
    await closeMongoClient();
    await closeRedisClient();
  });

  // 查看官方通知
  it("notice list", async function() {
    await collNotice.insertOne({
      userId: "sannian",
      text: "abc",
      timestampe: new Date(2000, 0, 1).getTime()
    });
    await collNotice.insertOne({
      userId: "sannian",
      text: "def",
      timestampe: new Date(2001, 0, 1).getTime()
    });
    await collNotice.insertOne({
      userId: "wangyun",
      text: "def",
      timestampe: new Date(2001, 0, 1).getTime()
    });
    {
      let { data } = await request.get("/notice/list");
      assert(data.code === 0);
      assert(data.list.length === 2);
    }
  });

  // 新用户分享奖励
  // 1 不合法的shareCode
  // 2 参数缺少
  // 3 分享成功
  // 4 重复请求分享奖励会失败
  it("notice read", async function() {
    await collNotice.insertOne({
      userId: "sannian",
      text: "abc",
      timestampe: new Date(2000, 0, 1).getTime()
    });
    await collNotice.insertOne({
      userId: "sannian",
      text: "def",
      timestampe: new Date(2001, 0, 1).getTime()
    });
    await collNotice.insertOne({
      userId: "wangyun",
      text: "ghi",
      timestampe: new Date(2001, 0, 1).getTime()
    });

    let id0 = (await collNotice.findOne({ text: "abc" }))._id.toString();
    let id2 = (await collNotice.findOne({ text: "ghi" }))._id.toString();
    console.log({ id0, id2 });
    {
      let { data } = await request.post("/notice/read", { id: id2 });
      assert(data.code !== 0);
    }
    {
      let { data } = await request.post("/notice/read", { id: id0 });
      assert(data.code === 0);
      {
        let data = await collNotice.findOne({ text: "abc" });
        assert(data.readTimestamp !== undefined);
      }
    }
  });
});
