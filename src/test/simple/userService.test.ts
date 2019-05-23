import assert = require("assert");
import getMongoClient from "../../getMongoClient";
import { MongoClient, Collection } from "mongodb";
import * as userService from "../../service/user";
import config from "../../config";

describe("user service", async function() {
  let client: MongoClient;
  let collection: Collection;
  before(async function() {
    client = await getMongoClient();
    await client.connect();
    collection = client.db(config.dbName).collection("user");
  });

  afterEach(async function() {
    // 清理所有数据
    await collection.deleteMany({});
  });

  after(async function() {
    await client.close();
  });

  it("addUser", async function() {
    await userService.addUser("sannian");
    let data = await collection.findOne({ userId: "sannian" });
    assert(data.userId === "sannian");
  });

  it("updateUser.fail", async function() {
    let flag = await userService.updateUser("sannian", { coin: 100 });

    assert(!flag);
  });

  it("updateUser.success", async function() {
    await collection.insertOne({ userId: "sannian" });

    let flag = await userService.updateUser("sannian", { coin: 100 });
    let data = await collection.findOne({ userId: "sannian" });
    assert(flag);
    assert(data.coin === 100);
  });

  it("getUser", async function() {
    await collection.insertOne({ userId: "sannian", nickname: "bitch" });

    let dataFail = await userService.getUser("wangyun");

    let dataSuccess = await userService.getUser("sannian");
    assert(dataFail === undefined);
    assert(dataSuccess && dataSuccess.nickname === "bitch");
  });
});
