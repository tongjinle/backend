import assert = require("assert");
import getMongoClient from "../../getMongoClient";
import { MongoClient, Collection } from "mongodb";
import * as photoService from "../../service/photo";

describe("photo service", async function() {
  let client: MongoClient;
  let collection: Collection;
  before(async function() {
    client = await getMongoClient();
    await client.connect();
    collection = client.db("cute").collection("photo");
  });

  afterEach(async function() {
    // 清理所有数据
    await collection.deleteMany({});
  });

  after(async function() {
    await client.close();
  });

  it("sort", async function() {
    await collection.insertMany([
      { id: "1", score: 49, url: "url1", nickname: "小松鼠", userId: "u1" },
      { id: "2", score: 99, url: "url2", nickname: "大老虎", userId: "u2" }
    ]);
    let data = await photoService.sort();
    assert(data[0].nickname === "大老虎");
    assert(data[1].nickname === "小松鼠");
  });
});
