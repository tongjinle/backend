import assert = require("assert");
import axios, { AxiosInstance } from "axios";
import { ChildProcess } from "child_process";
import config from "../../config";
import { closeMongoClient, dropDatabase } from "../../mongo";
import { closeRedisClient, flushDb } from "../../redis";
import utils from "../../utils";
import * as helper from "../helper";

describe("diary router", async function() {
  let request: AxiosInstance;

  let worker: ChildProcess;
  this.timeout(30 * 1000);
  async function createRequest(userId: string) {
    request = axios.create({
      baseURL: `${config.protocol}://${config.host}:${config.port}`,
      headers: {
        userId: userId,
        token: await utils.getUserToken(userId)
      }
    });
    return request;
  }

  before(async function() {
    worker = await helper.startApp();
  });

  beforeEach(async function() {
    await dropDatabase();
    await flushDb();
  });

  after(async function() {
    await helper.closeApp(worker);
    await closeMongoClient();
    await closeRedisClient();
  });

  // 新增一个日记
  it("add", async function() {
    this.timeout(200 * 60 * 1000);
    try {
      let count = 50;
      let arr = [];
      while (count--) {
        let userId: string = "user" + Math.floor(1e8 * Math.random());
        let req = await helper.createNotRegRequest(userId);
        let pr = req.post("/user/add", { nickname: userId, sex: "female" });
        arr.push(pr);
      }
      await Promise.all(arr);
    } catch (error) {
      console.log(error);
    }
  });
});
