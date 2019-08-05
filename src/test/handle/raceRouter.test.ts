import assert = require("assert");
import axios, { AxiosInstance } from "axios";
import { ChildProcess, fork } from "child_process";
import { Collection, MongoClient } from "mongodb";
import * as path from "path";
import config from "../../config";
import { closeMongoClient, getCollection } from "../../getMongoClient";
import * as raceService from "../../service/race";
import utils from "../../utils";

describe("race router", async function() {
  let request: AxiosInstance;
  let bareRequest: AxiosInstance;
  let client: MongoClient;
  let photos: Collection;
  let collRace: Collection;
  let collRacePlayer: Collection;
  let collRaceUpvoter: Collection;
  let collRaceUpvoterLog: Collection;
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

    collRace = await getCollection("race");
    collRacePlayer = await getCollection("racePlayer");
    collRaceUpvoter = await getCollection("raceUpvoter");
    collRaceUpvoterLog = await getCollection("race");
  });

  beforeEach(async function() {
    await Promise.all([
      collRace.deleteMany({}),
      collRacePlayer.deleteMany({}),
      collRaceUpvoter.deleteMany({}),
      collRaceUpvoterLog.deleteMany({})
    ]);
  });

  after(async function() {
    worker.kill();
    await closeMongoClient();
  });

  it("player", async function() {
    await collRacePlayer.insertMany([
      {
        raceName: "seed",
        userId: "sannian",
        nickname: "三年",
        logoUrl: "sannian.jpg",
        upvote: 10000
      },
      {
        raceName: "seed2",
        userId: "sannian",
        nickname: "三年",
        logoUrl: "sannian.jpg",
        upvote: 1000
      },
      {
        raceName: "seed",
        userId: "wangyun",
        nickname: "王云",
        logoUrl: "wangyun.jpg",
        upvote: 90
      }
    ]);

    let { data } = await request.get("/race/player", {
      params: { name: "seed", limit: 10 }
    });
    console.log(data);
    assert(data && data.list.length === 2);
  });

  it("upvoter", async function() {
    await collRaceUpvoter.insertMany([
      {
        raceName: "seed",
        userId: "sannian",
        nickname: "三年",
        logoUrl: "sannian.jpg",
        coin: 10000
      },
      {
        raceName: "seed2",
        userId: "sannian",
        nickname: "三年",
        logoUrl: "sannian.jpg",
        coin: 1000
      },
      {
        raceName: "seed",
        userId: "wangyun",
        nickname: "王云",
        logoUrl: "wangyun.jpg",
        coin: 90
      }
    ]);

    let { data } = await request.get("/race/upvoter", {
      params: { name: "seed2", limit: 10 }
    });
    assert(data && data.list.length === 1);
  });
});
