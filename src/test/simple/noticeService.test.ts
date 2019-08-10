import assert = require("assert");
import { Collection, MongoClient } from "mongodb";
import {
  closeMongoClient,
  getCollection,
  getMongoClient,
  getObjectId
} from "../../getMongoClient";
import * as noticeService from "../../service/notice";

describe("notice service", async function() {
  let client: MongoClient;
  let collNotice: Collection;
  before(async function() {
    client = await getMongoClient();
    collNotice = await getCollection("notice");
  });

  beforeEach(async function() {
    // 清理所有数据
    await collNotice.deleteMany({});
  });

  after(async function() {
    await closeMongoClient();
  });

  // 新增通知
  it("add", async function() {
    await noticeService.add("sannian", "hi", 0, "normal");

    {
      let data = await collNotice.findOne({ userId: "sannian" });
      assert(data.coin === 0);
    }
  });

  it("can action", async function() {
    await collNotice.insertOne({
      _id: getObjectId("1234567890a0"),
      userId: "sannian"
    });
    await collNotice.insertOne({
      _id: getObjectId("1234567890a1"),
      userId: "sannian2"
    });
    {
      let can = await noticeService.canAction("1234567890a0", "sannian");
      assert(can);
    }
    {
      let can = await noticeService.canAction("1234567890a1", "sannian");
      assert(!can);
    }
  });

  it("remove", async function() {
    await collNotice.insertOne({
      _id: getObjectId("1234567890a0"),
      userId: "sannian"
    });
    await noticeService.remove("1234567890a0");

    let data = await collNotice.findOne({ _id: getObjectId("1234567890a0") });
    assert(!data);
  });

  it("read", async function() {
    await collNotice.insertOne({
      _id: getObjectId("1234567890a0"),
      userId: "sannian"
    });
    await noticeService.read("1234567890a0");
    let data = await collNotice.findOne({ _id: getObjectId("1234567890a0") });
    assert(data && data.readTimestamp !== undefined);
  });

  it("list", async function() {
    await collNotice.insertOne({
      _id: getObjectId("1234567890a0"),
      userId: "sannian"
    });
    await collNotice.insertOne({
      _id: getObjectId("1234567890a1"),
      userId: "sannian"
    });
    await collNotice.insertOne({
      _id: getObjectId("1234567890a2"),
      userId: "sannian"
    });
    await collNotice.insertOne({
      _id: getObjectId("1234567890a3"),
      userId: "sannian2"
    });
    let data = await noticeService.list("sannian");
    assert(data && data.length === 3);
  });
});
