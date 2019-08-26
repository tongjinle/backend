import assert = require("assert");
import axios, { AxiosInstance } from "axios";
import { ChildProcess, fork } from "child_process";
import { Collection, MongoClient } from "mongodb";
import * as path from "path";
import config from "../../config";
import { closeMongoClient, getCollection } from "../../mongo";
import utils from "../../utils";

describe("user router", async function() {
  let request: AxiosInstance;
  let bareRequest: AxiosInstance;
  let client: MongoClient;
  let photos: Collection;
  let collUser: Collection;
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

    collUser = await getCollection("user");
  });

  beforeEach(async function() {
    await Promise.all([collUser.deleteMany({})]);
  });

  after(async function() {
    worker.kill();
    await closeMongoClient();
  });

  it("addUser", async function() {
    await request.post("/user/add", { nickname: "三年" });
    let data = await collUser.findOne({ userId: "sannian" });
    assert(data);
  });

  it("user info", async function() {
    await request.post("/user/add", { nickname: "三年" });
    let { data } = await request.get("/user/info");
    assert(
      data.userId === "sannian" && data.nickname === "三年" && data.coin === 0
    );
  });

  it("update user", async function() {
    await request.post("/user/add", { nickname: "三年" });
    await request.post("/user/update", { nickname: "婊子", birthYear: 2000 });

    let { data } = await request.get("/user/info");
    assert(
      data.userId === "sannian" &&
        data.nickname === "婊子" &&
        data.birthYear === 2000
    );
  });
});
