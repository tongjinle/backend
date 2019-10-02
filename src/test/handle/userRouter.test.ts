import assert = require("assert");
import { AxiosInstance } from "axios";
import { ChildProcess } from "child_process";
import { Collection, MongoClient } from "mongodb";
import { closeMongoClient, dropDatabase, getCollection } from "../../mongo";
import { closeRedisClient, flushDb } from "../../redis";
import * as helper from "../helper";
import assert = require("assert");

describe("user router", async function() {
  let request: AxiosInstance;
  let bareRequest: AxiosInstance;
  let client: MongoClient;
  let photos: Collection;
  let collUser: Collection;
  let worker: ChildProcess;

  this.timeout(30 * 1000);
  before(async function() {
    worker = await helper.startApp();

    collUser = await getCollection("user");
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

  it("addUser", async function() {
    await request.post("/user/add", { nickname: "三年" });
    let data = await collUser.findOne({ userId: "sannian" });
    assert(data);
  });

  it("user info", async function() {
    let { data } = await request.get("/user/info");
    assert(data.userId === "sannian" && data.coin === 0);
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
