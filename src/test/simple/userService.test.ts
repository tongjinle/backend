import assert = require("assert");
import { Collection, MongoClient } from "mongodb";
import {
  closeMongoClient,
  getCollection,
  getMongoClient
} from "../../mongo";
import * as userService from "../../service/user";

describe("user service", async function() {
  let client: MongoClient;
  let collection: Collection;
  before(async function() {
    client = await getMongoClient();
    collection = await getCollection("user");
  });

  beforeEach(async function() {
    // 清理所有数据
    await collection.deleteMany({});
  });

  after(async function() {
    await closeMongoClient();
  });

  // 能否新增用户
  // 1 sannian未在用户中,返回true
  // 2 sannian已经在用户中,返回false
  it("canAddUser", async function() {
    let rst = await userService.canAdd("sannian");
    assert(rst);

    {
      await collection.insertOne({ userId: "sannian" });
      let rst = await userService.canAdd("sannian");
      assert(rst === false);
    }
  });

  it("addUser", async function() {
    let user: userService.BasicInfo = {
      userId: "sannian",
      nickname: "三年",
      gender: "female"
    } as userService.BasicInfo;
    await userService.add(user);
    let data = await collection.findOne({ userId: "sannian" });
    assert(data.userId === "sannian");
  });

  it("updateUser", async function() {
    await collection.insertOne({ userId: "sannian" });

    await userService.update("sannian", { coin: 100 });
    let data = await collection.findOne({ userId: "sannian" });
    assert(data.coin === 100);
  });

  it("getUser", async function() {
    await collection.insertOne({ userId: "sannian", nickname: "bitch" });

    let dataFail = await userService.find("wangyun");

    let dataSuccess = await userService.find("sannian");
    assert(dataFail === null);
    assert(dataSuccess && dataSuccess.nickname === "bitch");
  });
});
