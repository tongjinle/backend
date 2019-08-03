import assert = require("assert");
import {
  getMongoClient,
  closeMongoClient,
  getCollection
} from "../../getMongoClient";
import { MongoClient, Collection } from "mongodb";
import * as diaryService from "../../service/diary";
import config from "../../config";
import { domainToASCII } from "url";
import { disallow } from "@hapi/joi";

describe("diary service", async function() {
  let client: MongoClient;
  let collDairy: Collection;
  let collDairyUpvote: Collection;
  before(async function() {
    client = await getMongoClient();
    collDairy = await getCollection("diary");
    collDairyUpvote = await getCollection("diaryUpvote");
  });

  beforeEach(async function() {
    // 清理所有数据
    await Promise.all([
      collDairy.deleteMany({}),
      collDairyUpvote.deleteMany({})
    ]);
  });

  after(async function() {
    await closeMongoClient();
  });

  // 新增
  it("add", async function() {
    await diaryService.add(
      "sannian",
      "abc",
      "url",
      diaryService.MediaType.image,
      90
    );
    let dairy = await collDairy.findOne({ userId: "sannian" });
    assert(dairy && dairy.score === 90);
  });

  // 删除
  it("remove", async function() {
    await diaryService.add(
      "sannian",
      "abc",
      "url",
      diaryService.MediaType.image,
      90
    );

    let id = (await collDairy.findOne({ userId: "sannian" }))._id.toString();

    await diaryService.remove(id);

    let data = await collDairy.findOne({ userId: "sannian" });
    assert(!data);
  });

  // 查找日记
  it("find", async function() {
    await diaryService.add(
      "sannian",
      "abc",
      "url",
      diaryService.MediaType.image,
      90
    );
    let id = (await collDairy.findOne({ userId: "sannian" }))._id.toString();

    let data = await diaryService.find(id);
    assert(data);
    assert(typeof data.timestamp === "number");
    assert(data.upvote === 0);
    assert(data.coin === 0);
  });

  // 打榜
  it("upvote", async function() {
    await diaryService.add(
      "sannian",
      "abc",
      "url",
      diaryService.MediaType.image,
      90
    );
    let id = (await collDairy.findOne({ userId: "sannian" }))._id.toString();
    await diaryService.upvote(id, "tong", 100);
    await diaryService.upvote(id, "jin", 10);

    {
      let data = await diaryService.find(id);
      assert(data.upvote === 2 && data.coin === 110);
    }
    {
      let data = await collDairyUpvote.findOne({ diaryId: id, userId: "tong" });
      assert(data.coin === 100);
    }
  });
});
