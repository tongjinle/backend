import assert = require("assert");
import axios, { AxiosInstance } from "axios";
import { ChildProcess, fork } from "child_process";
import { Collection, MongoClient } from "mongodb";
import * as path from "path";
import config from "../../config";
import { closeMongoClient, getCollection, dropDatabase } from "../../mongo";
import * as raceService from "../../service/race";
import utils from "../../utils";
import * as helper from "../helper";
import { flushDb, closeRedisClient } from "../../redis";

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

  this.timeout(30 * 1000);
  before(async function() {
    worker = await helper.startApp();

    collRace = await getCollection("race");
    collRacePlayer = await getCollection("racePlayer");
    collRaceUpvoter = await getCollection("raceUpvoter");
    collRaceUpvoterLog = await getCollection("race");
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
