import assert = require("assert");
import { Collection, MongoClient } from "mongodb";
import {
  closeMongoClient,
  getCollection,
  getMongoClient
} from "../../getMongoClient";
import * as shareService from "../../service/share";
import { accessSync } from "fs";

describe("user service", async function() {
  let client: MongoClient;
  let collShare: Collection;
  let collShareLink: Collection;
  before(async function() {
    client = await getMongoClient();
    collShare = await getCollection("share");
    collShareLink = await getCollection("shareLink");
  });

  beforeEach(async function() {
    // 清理所有数据
    await collShare.deleteMany({});
    await collShareLink.deleteMany({});
  });

  after(async function() {
    await closeMongoClient();
  });

  // 获取分享码 和 分享码的验证
  it("shareCode", async function() {
    let userId = "sannian";
    let shareCode = await shareService.shareCode(userId);
    assert(shareCode);

    let check1 = await shareService.isShareCodeValid(userId, shareCode);
    let check2 = await shareService.isShareCodeValid("bitch", shareCode);
    assert(check1);
    assert(!check2);
  });

  // 是否已经分享
  it("isShared", async function() {
    let isShared = await shareService.isShared("sannian", 2000, 1, 1);
    assert(!isShared);

    {
      await collShare.insertOne({
        userId: "sannian",
        year: 2000,
        month: 1,
        day: 1
      });

      let isShared = await shareService.isShared("sannian", 2000, 1, 1);
      assert(isShared);
    }
  });

  // 分享记录
  it("share", async function() {
    let coin = await shareService.share("sannian", 2000, 1, 1);
    assert(coin > 0);

    let data = await collShare.findOne({
      userId: "sannian",
      year: 2000,
      month: 1,
      day: 1
    });
    assert(!!data);
  });

  // 是否已经分享奖励
  it("isRewarded", async function() {
    let isRewarded = await shareService.isRewarded("sannian", "bitch");
    assert(!isRewarded);

    {
      await collShareLink.insertOne({ userId: "sannian", inviterId: "bitch" });
      let isRewarded = await shareService.isRewarded("sannian", "bitch");
      assert(isRewarded);
    }
  });

  // 分享奖励(拉到新用户)
  it("shareReward", async function() {
    let reward = await shareService.reward("sannian", "bitch");
    assert(reward > 0);

    let data = collShareLink.findOne({ userId: "sannian", inviterId: "bitch" });
    assert(!!data);
  });
});
