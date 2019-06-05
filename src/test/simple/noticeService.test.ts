import assert = require("assert");
import * as noticeService from "../../service/noticeService";
import { MongoClient } from "mongodb";
import getMongoClient from "../../getMongoClient";
import config from "../../config";
import { beforeEach } from "mocha";

let dbName = config.dbName;

describe("notice service", () => {
  let mongo: MongoClient;
  before(async function() {
    mongo = await getMongoClient();
  });

  beforeEach(async function() {
    await mongo
      .db(dbName)
      .collection("notice")
      .deleteMany({});
  });

  after(async function() {
    await mongo.close();
  });

  it("add", async function() {
    await noticeService.add("tongjinle", "hi", 100);

    let data = await mongo
      .db(dbName)
      .collection("notice")
      .findOne({ token: "tongjinle" });

    assert(data && data.isRead === false);
  });

  it("list && read", async function() {
    await noticeService.add("tongjinle", "hi", 100);
    await noticeService.add("tongjinle", "hi2", 50);
    await noticeService.add("zhousuting", "hi3", 100);

    let list = await noticeService.list("tongjinle");

    assert(list.length === 2);

    await noticeService.read(list[0].id);
    let list2 = await noticeService.list("tongjinle");

    assert(list2.length === 1);
  });
});
