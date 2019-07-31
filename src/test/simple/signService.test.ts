import assert = require("assert");
import { Collection, MongoClient } from "mongodb";
import {
  closeMongoClient,
  getCollection,
  getMongoClient
} from "../../getMongoClient";
import * as signService from "../../service/sign";

describe("sign service", async function() {
  let client: MongoClient;
  let collection: Collection;
  before(async function() {
    client = await getMongoClient();
    collection = await getCollection("sign");
  });

  beforeEach(async function() {
    // 清理所有数据
    await collection.deleteMany({});
  });

  after(async function() {
    await closeMongoClient();
  });

  // 是否已经签到(假设用户是存在的)
  // 1 2000-0-1未签到,返回false
  // 2 2000-0-1已经签到,返回true
  it("isSign", async function() {
    let rst = await signService.isSigned("sannian", 2000, 0, 1);
    assert(rst === false);

    {
      await collection.insertOne({
        userId: "sannian",
        year: 2000,
        month: 0,
        day: 1
      });
      let rst = await signService.isSigned("sannian", 2000, 0, 1);
      assert(rst);
    }
  });

  it("sign", async function() {
    await signService.sign("sannian", 2000, 0, 1);
    let data = await collection.findOne({
      userId: "sannian",
      year: 2000,
      month: 0,
      day: 1
    });
    assert(!!data);
  });

  it("signList", async function() {
    let userId = "sannian";
    let year = 2019;
    let month = 6;
    let days = [1, 2, 7, 8, 13];
    await Promise.all(
      days.map(day => signService.sign(userId, year, month, day))
    );

    let list = await signService.signList(userId, 2019, 6);
    assert(list && list.length === 5);
    // 检测大签到
    assert(list[2].coin > list[0].coin);
  });
});
