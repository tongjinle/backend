import assert = require("assert");
import axios, { AxiosInstance } from "axios";
import { ChildProcess, fork } from "child_process";
import { Collection, MongoClient } from "mongodb";
import * as path from "path";
import config from "../../config";
import { closeMongoClient, getCollection } from "../../getMongoClient";
import * as diaryService from "../../service/diary";
import * as userService from "../../service/user";
import * as raceService from "../../service/race";
import utils from "../../utils";
import { resolve } from "url";

describe("diary router", async function() {
  let request: AxiosInstance;

  let worker: ChildProcess;

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

  async function delay(ms: number) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  before(async function() {
    this.timeout(30 * 1000);
    let file = path.resolve(__dirname, "../../app.js");
    console.log(file);
    worker = fork(file);
    await new Promise(resolve => {
      setTimeout(resolve, 3 * 1000);
    });
  });

  beforeEach(async function() {});

  after(async function() {
    worker.kill();
    await closeMongoClient();
  });

  // 新增一个日记
  it("add", async function() {
    this.timeout(200 * 60 * 1000);
    try {
      let count = 10;
      let arr = [];
      while (count--) {
        let userId: string = "user" + Math.floor(1e8 * Math.random());
        let req = await createRequest(userId);
        let pr = req.post("/user/add", { nickname: userId, sex: "female" });
        arr.push(pr);
        await delay(200);
        // await req.post("/user/add", { nickname: userId, sex: "female" });
      }
      await Promise.all(arr);
    } catch (error) {
      console.log(error);
    }
  });
});
