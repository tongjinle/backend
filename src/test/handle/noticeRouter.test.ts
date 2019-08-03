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
import * as noticeService from "../../service/notice";
import { fork, ChildProcess } from "child_process";
import * as path from "path";
import utils from "../../utils";
import * as protocol from "../../protocol";

describe("sign router", async function() {
  let request: AxiosInstance;
  let bareRequest: AxiosInstance;
  let client: MongoClient;
  let photos: Collection;
  let collNotice: Collection;
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

    collNotice = await getCollection("notice");
  });

  beforeEach(async function() {
    await Promise.all([collNotice.deleteMany({})]);
  });

  after(async function() {
    worker.kill();
    await closeMongoClient();
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
      let { data } = await request.get("/user/notice/list");
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
      let { data } = await request.post("/user/notice/read", { id: id2 });
      assert(data.code !== 0);
    }
    {
      let { data } = await request.post("/user/notice/read", { id: id0 });
      assert(data.code === 0);
      {
        let data = await collNotice.findOne({ text: "abc" });
        assert(data.readTimestamp !== undefined);
      }
    }
  });
});
