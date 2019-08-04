import assert = require("assert");
import axios, { AxiosInstance } from "axios";
import { ChildProcess, fork } from "child_process";
import { Collection, MongoClient } from "mongodb";
import * as path from "path";
import config from "../../config";
import { closeMongoClient, getCollection } from "../../getMongoClient";
import * as diaryService from "../../service/diary";
import * as userService from "../../service/user";
import utils from "../../utils";

describe("diary router", async function() {
  let request: AxiosInstance;
  let bareRequest: AxiosInstance;
  let client: MongoClient;
  let photos: Collection;
  let collUser: Collection;
  let collDiary: Collection;
  let collDiaryUpvote: Collection;
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

    collDiary = await getCollection("diary");
    collDiaryUpvote = await getCollection("diaryUpvote");
    collUser = await getCollection("user");
  });

  beforeEach(async function() {
    await Promise.all([
      collDiary.deleteMany({}),
      collDiaryUpvote.deleteMany({}),
      collUser.deleteMany({})
    ]);
  });

  after(async function() {
    worker.kill();
    await closeMongoClient();
  });

  // 新增一个日记
  it("add", async function() {
    await request.post("/diary/add", {
      text: "abc",
      url: "1.jpg",
      type: "image",
      score: 90
    });

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
        coin: 100,
        kk: 123
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
