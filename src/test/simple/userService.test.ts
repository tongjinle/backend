import assert = require("assert");
import * as userService from "../../service/userService";
import { MongoClient } from "mongodb";
import { getMongoClient, closeMongoClient } from "../../getMongoClient";
import config from "../../config";
import { ICreateHandyClient, IHandyRedis } from "handy-redis";
import { getRedisClient, closeRedisClient } from "../../getRedisClient";
import { func } from "@hapi/joi";

let dbName = config.dbName;

describe("user service", () => {
  let mongo: MongoClient;
  let redis: IHandyRedis;
  before(async function() {
    mongo = await getMongoClient();
    redis = await getRedisClient();
  });

  beforeEach(async function() {
    await Promise.all(
      ["user", "contribute"].map(coName => {
        return mongo
          .db(dbName)
          .collection(coName)
          .deleteMany({});
      })
    );
  });

  after(async function() {
    await closeMongoClient();
    await closeRedisClient();
  });

  it("reg", async function() {
    let token = await userService.reg();
    console.log(token);
    let data = await mongo
      .db(dbName)
      .collection("user")
      .findOne({ token });
    assert(!!data);
  });

  it("coin", async function() {
    let coin0 = await userService.coin("noone");
    assert(coin0 === 0);

    let token = await userService.reg();
    let coin1 = await userService.coin(token);
    assert(coin1 === config.defaultCoin);
  });

  it("contribute", async function() {
    let token = "tongjinle";
    let url = "http://resource.zip";
    await userService.contribute(token, url);
    let data = await mongo
      .db(dbName)
      .collection("contribute")
      .findOne({ token });
    assert(data && data.url === url && data.isCheck === false);
  });
});
