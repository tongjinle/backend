import assert = require("assert");
import axios, { AxiosInstance } from "axios";
import { ChildProcess, fork } from "child_process";
import { Collection, MongoClient } from "mongodb";
import * as path from "path";
import config from "../../config";
import { closeMongoClient, getCollection, dropDatabase } from "../../mongo";
import * as diaryService from "../../service/diary";
import * as userService from "../../service/user";
import * as raceService from "../../service/race";
import utils from "../../utils";
import * as helper from "../helper";
import { closeRedisClient, flushDb } from "../../redis";

describe("diary router", async function() {
  let request: AxiosInstance;
  let bareRequest: AxiosInstance;
  let client: MongoClient;
  let photos: Collection;
  let collUser: Collection;
  let collDiary: Collection;
  let collDiaryUpvote: Collection;
  let collRace: Collection;
  let collPlayer: Collection;
  let collUpvoter: Collection;
  let collUpvoteLog: Collection;
  let worker: ChildProcess;

  before(async function() {
    this.timeout(30 * 1000);
    worker = await helper.startApp();

    collDiary = await getCollection("diary");
    collDiaryUpvote = await getCollection("diaryUpvote");
    collUser = await getCollection("user");
    collRace = await getCollection("race");
    collPlayer = await getCollection("racePlayer");
    collUpvoter = await getCollection("raceUpvote");
    collUpvoteLog = await getCollection("raceUpvoteLog");
  });

  beforeEach(async function() {
    await dropDatabase();
    await flushDb();
    request = await helper.createRequest("sannian");
    bareRequest = await helper.createBareRequest();
  });

  after(async function() {
    await helper.closeApp(worker);
    await closeMongoClient();
    await closeRedisClient();
  });

  // 新增一个日记
  it("add", async function() {
    let res = await request.post("/diary/add", {
      text: "abc",
      url: "1.jpg",
      type: "image",
      score: 90
    });

    assert(res.data.code === 0);

    let data = await collDiary.findOne({ text: "abc" });
    assert(data);
  });

  // 查找一个日记
  it("find", async function() {
    await request.post("/diary/add", {
      text: "abc",
      url: "1.jpg",
      type: "image",
      score: 90
    });

    let id = (await collDiary.findOne({ text: "abc" }))._id.toString();
    let { data } = await request.get("/diary/query", { params: { id } });
    assert(data.text === "abc" && data.type === "image");
  });

  // 删除一个日记
  it("remove", async function() {
    await request.post("/diary/add", {
      text: "abc",
      url: "1.jpg",
      type: "image",
      score: 90
    });

    let id = (await collDiary.findOne({ text: "abc" }))._id.toString();
    await request.post("/diary/remove", { id });

    let data = await collDiary.findOne({ text: "abc" });
    assert(!data);
  });

  // 打榜一个日记
  it("upvote-fail", async function() {
    await userService.add({
      userId: "bitch",
      nickname: "婊子",
      logoUrl: "",
      gender: "female",
      city: ""
    });
    await userService.add({
      userId: "sannian",
      nickname: "三年",
      logoUrl: "",
      gender: "female",
      city: ""
    });
    await diaryService.add(
      "bitch",
      "abc",
      "1.jpg",
      diaryService.MediaType.image,
      90
    );
    await diaryService.add(
      "bitch",
      "def",
      "1.jpg",
      diaryService.MediaType.image,
      80
    );

    let id = (await collDiary.findOne({ text: "abc" }))._id.toString();
    {
      // 缺少足够代币
      let { data } = await request.post("/diary/upvote", {
        id,
        coin: 100
      });
      console.log({ id, data });
      assert(data.code !== 0);
    }
  });

  it("upvote-success", async function() {
    await userService.add({
      userId: "bitch",
      nickname: "婊子",
      logoUrl: "",
      gender: "female",
      city: ""
    });
    await userService.add({
      userId: "sannian",
      nickname: "三年",
      logoUrl: "",
      gender: "female",
      city: ""
    });
    await diaryService.add(
      "bitch",
      "abc",
      "1.jpg",
      diaryService.MediaType.image,
      90
    );
    await diaryService.add(
      "bitch",
      "def",
      "1.jpg",
      diaryService.MediaType.image,
      80
    );

    let id = (await collDiary.findOne({ text: "abc" }))._id.toString();

    {
      await userService.updateCoin("sannian", 10000);
      let { data } = await request.post("/diary/upvote", {
        id,
        coin: 100
      });

      assert(data.code === 0);

      let sannian = await userService.find("sannian");
      assert(sannian.coin === 9900);
      assert(sannian.upvoted === 1);
      assert(sannian.upvotedCoin === 100);
      let bitch = await userService.find("bitch");
      assert(bitch.coin === 0);
      assert(bitch.beUpvoted === 1);
      assert(bitch.beUpvotedCoin === 100);
    }
  });
  it("upvote-race", async function() {
    this.timeout(30 * 1000);
    await userService.add({
      userId: "bitch",
      nickname: "婊子",
      logoUrl: "",
      gender: "female",
      city: ""
    });
    // await userService.add({
    //   userId: "sannian",
    //   nickname: "三年",
    //   logoUrl: "",
    //   gender: "female",
    //   city: ""
    // });
    await diaryService.add(
      "bitch",
      "abc",
      "1.jpg",
      diaryService.MediaType.image,
      90
    );
    let id = (await collDiary.findOne({ text: "abc" }))._id.toString();

    // 准备race
    let collPlayer = await getCollection("racePlayer");
    let collUpvoter = await getCollection("raceUpvote");
    let collUpvoteLog = await getCollection("raceUpvoteLog");
    {
      await raceService.add("seed", 7, []);
    }

    {
      await userService.updateCoin("sannian", 10000);
      await request.post("/diary/upvote", {
        id,
        coin: 100
      });

      let data = await collPlayer.findOne({ userId: "bitch" });
      assert(!data);
    }

    {
      // 开启比赛
      await raceService.start("seed");
      await userService.updateCoin("sannian", 10000);
      await request.post("/diary/upvote", {
        id,
        coin: 100
      });

      let data = await collPlayer.findOne({ userId: "bitch" });
      assert(data);
    }
  });

  // 日记列表
  it("list", async function() {
    await diaryService.add(
      "bitch",
      "abc",
      "1.jpg",
      diaryService.MediaType.image,
      90
    );
    await diaryService.add(
      "bitch",
      "abc",
      "1.jpg",
      diaryService.MediaType.image,
      90
    );
    await diaryService.add(
      "bitch2",
      "abc",
      "1.jpg",
      diaryService.MediaType.image,
      90
    );

    let { data } = await request.get("/diary/list", {
      params: { userId: "bitch" }
    });
    assert(data.list.length === 2);
  });
});
