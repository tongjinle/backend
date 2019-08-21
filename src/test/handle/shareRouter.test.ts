import assert = require("assert");
import {
  getMongoClient,
  closeMongoClient,
  getCollection
} from "../../getMongoClient";
import { MongoClient, Collection } from "mongodb";
import config from "../../config";
import axios, { AxiosInstance } from "axios";
import errs from "../../errCode";
import * as userService from "../../service/user";
import { fork, ChildProcess } from "child_process";
import * as path from "path";
import utils from "../../utils";
import * as protocol from "../../protocol";

describe("share router", async function() {
  let request: AxiosInstance;
  let bareRequest: AxiosInstance;
  let client: MongoClient;
  let photos: Collection;
  let collUser: Collection;
  let collShare: Collection;
  let collShareLink: Collection;
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

    collShare = await getCollection("share");
    collUser = await getCollection("user");
    collShareLink = await getCollection("shareLink");
  });

  beforeEach(async function() {
    await Promise.all([
      collUser.deleteMany({}),
      collShare.deleteMany({}),
      collShareLink.deleteMany({})
    ]);
  });

  after(async function() {
    worker.kill();
    await closeMongoClient();
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
    let today = new Date();
    let [year, month, day] = [
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ];

    let sharerId: string = "wangyun";
    await collUser.insertOne({ userId: "sannian" });
    let shareCode: string = utils.getShareCode(sharerId);
    {
      let { data } = await request.post("/share/reward", {
        sharerId,
        shareCode: "123"
      });
      assert(data.code !== 0);
    }

    {
      let { data } = await request.post("/share/reward", { shareCode });
      assert(data.code !== 0);
    }

    {
      let { data } = await request.post("/share/reward", {
        sharerId,
        shareCode
      });
      assert(data.code === 0);
    }
    {
      let data = await collShareLink.findOne({
        userId: "sannian",
        sharerId
      });
      assert(data);
    }

    {
      let { data } = await request.post("/share/reward", {
        sharerId,
        shareCode
      });
      assert(data.code !== 0);
    }
  });
});
