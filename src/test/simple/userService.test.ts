import assert = require("assert");
import { getMongoClient, closeMongoClient } from "../../getMongoClient";
import { MongoClient, Collection } from "mongodb";
import * as userService from "../../service/user";
import config from "../../config";

describe("user service", async function() {
  let client: MongoClient;
  let collection: Collection;
  before(async function() {
    client = await getMongoClient();
    collection = client.db(config.dbName).collection("user");
  });

  beforeEach(async function() {
    // 清理所有数据
    await collection.deleteMany({});
  });

  after(async function() {
    await closeMongoClient();
  });

  // it("addUser", async function() {
  //   await userService.add("sannian");
  //   let data = await collection.findOne({ userId: "sannian" });
  //   assert(data.userId === "sannian");
  // });

  // it("updateUser.fail", async function() {
  //   let flag = await userService.update("sannian", { coin: 100 });

  //   assert(!flag);
  // });

  // it("updateUser.success", async function() {
  //   await collection.insertOne({ userId: "sannian" });

  //   let flag = await userService.update("sannian", { coin: 100 });
  //   let data = await collection.findOne({ userId: "sannian" });
  //   assert(flag);
  //   assert(data.coin === 100);
  // });

  // it("getUser", async function() {
  //   await collection.insertOne({ userId: "sannian", nickname: "bitch" });

  //   let dataFail = await userService.find("wangyun");

  //   let dataSuccess = await userService.find("sannian");
  //   assert(dataFail === undefined);
  //   assert(dataSuccess && dataSuccess.nickname === "bitch");
  // });
});
