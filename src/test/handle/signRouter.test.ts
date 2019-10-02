import assert = require("assert");
import { AxiosInstance } from "axios";
import { ChildProcess } from "child_process";
import { Collection, MongoClient } from "mongodb";
import { closeMongoClient, dropDatabase, getCollection } from "../../mongo";
import { closeRedisClient, flushDb } from "../../redis";
import * as helper from "../helper";

describe("sign router", async function() {
  let request: AxiosInstance;
  let bareRequest: AxiosInstance;
  let client: MongoClient;
  let photos: Collection;
  let collSign: Collection;
  let worker: ChildProcess;
  this.timeout(30 * 1000);

  before(async function() {
    worker = await helper.startApp();

    collSign = await getCollection("sign");
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

  it("isSign", async function() {
    let { data } = await request.get("/sign/isSign");
    assert(!data.isSign);

    {
      let today = new Date();
      let [year, month, day] = [
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      ];
      await collSign.insertOne({ userId: "sannian", year, month, day });

      let { data } = await request.get("/sign/isSign");
      assert(data.isSign);
    }
  });

  it("sign", async function() {
    let today = new Date();
    let [year, month, day] = [
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ];
    await request.post("/sign");

    let data = await collSign.findOne({ userId: "sannian", year, month, day });
    assert(data);
  });

  it("sign list", async function() {
    let today = new Date();
    let [year, month] = [today.getFullYear(), today.getMonth()];
    let days = [1, 4, 13];
    await Promise.all(
      days.map(day => {
        return collSign.insertOne({ userId: "sannian", year, month, day });
      })
    );

    let { data } = await request.get("/sign/list", {
      params: { year, month }
    });
    assert(data.days.length > 0);
    assert.deepEqual(data.signed, days);
  });
});
