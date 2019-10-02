import assert = require("assert");
import { AxiosInstance } from "axios";
import { ChildProcess } from "child_process";
import { Collection, MongoClient } from "mongodb";
import { closeMongoClient, dropDatabase, getCollection } from "../../mongo";
import { closeRedisClient, flushDb } from "../../redis";
import utils from "../../utils";
import * as helper from "../helper";

describe("share router", async function() {
  let request: AxiosInstance;
  let client: MongoClient;
  let photos: Collection;
  let collUser: Collection;
  let collShare: Collection;
  let collShareLink: Collection;
  let worker: ChildProcess;

  this.timeout(30 * 1000);
  before(async function() {
    worker = await helper.startApp();

    collShare = await getCollection("share");
    collUser = await getCollection("user");
    collShareLink = await getCollection("shareLink");
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

  // 分享记录
  // 1 可以记录
  // 2 第二次请求记录的时候,会通知已经记录过了
  it("share", async function() {
    let today = new Date();
    let [year, month, day] = [
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ];
    {
      let { data } = await request.post("/share");
      assert(data.code === 0);
    }

    {
      let data = await collShare.findOne({
        userId: "sannian",
        year,
        month,
        day
      });
      assert(data);
    }

    {
      let { data } = await request.post("/share");
      assert(data.code !== 0);
    }
  });

  // 新用户分享奖励
  // 1 不合法的shareCode
  // 2 参数缺少
  // 3 分享成功
  // 4 重复请求分享奖励会失败
  it("share reward", async function() {
    let userId = "zhushuting";
    let today = new Date();
    let [year, month, day] = [
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ];

    let sharerId: string = "wangyun";
    let shareCode: string = utils.getShareCode(sharerId);
    // shareCode不能被篡改
    {
      let { data } = await request.post("/share/reward", {
        sharerId,
        shareCode: "123"
      });
      assert(data.code !== 0);
    }

    // 必须带上shareId
    {
      let { data } = await request.post("/share/reward", { shareCode });
      assert(data.code !== 0);
    }

    // 正确得到奖励
    {
      let { data } = await request.post("/share/reward", {
        sharerId,
        shareCode
      });
      assert(data.code === 0);
    }
    // 能在shareLink表中找到记录
    {
      let data = await collShareLink.findOne({
        userId,

        sharerId
      });
      assert(data);
    }

    // 再次请求奖励不能成功
    {
      let { data } = await request.post("/share/reward", {
        sharerId,
        shareCode
      });
      assert(data.code !== 0);
    }
  });
});
