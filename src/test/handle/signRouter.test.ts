import assert = require("assert");
import { getMongoClient, closeMongoClient, getCollection } from "../../mongo";
import { MongoClient, Collection } from "mongodb";
import config from "../../config";
import axios, { AxiosInstance } from "axios";
import errs from "../../errCode";
import * as userService from "../../service/user";
import { fork, ChildProcess } from "child_process";
import * as path from "path";
import utils from "../../utils";
import * as protocol from "../../protocol";

describe("sign router", async function() {
  let request: AxiosInstance;
  let bareRequest: AxiosInstance;
  let client: MongoClient;
  let photos: Collection;
  let collSign: Collection;
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

    collSign = await getCollection("sign");
  });

  beforeEach(async function() {
    await Promise.all([collSign.deleteMany({})]);
  });

  after(async function() {
    worker.kill();
    await closeMongoClient();
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
