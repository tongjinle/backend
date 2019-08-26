import assert = require("assert");
import { Collection, MongoClient } from "mongodb";
import { closeMongoClient, getCollection, getMongoClient } from "../../mongo";
import * as userService from "../../service/user";
import * as coinService from "../../service/coin";
import * as raceService from "../../service/race";

const RACE = "race";
const RACE_PLAYER = "racePlayer";
const RACE_UPVOTER = "raceUpvoter";
const RACE_UPVOTE_LOG = "raceUpvoteLog";

describe("race service", async function() {
  let client: MongoClient;
  let collRace: Collection;
  let collPlayer: Collection;
  let collUpvoter: Collection;
  let collUpvoteLog: Collection;

  const sannian: raceService.IPlayer = {
    userId: "sannian",
    nickname: "三年",
    logoUrl: "sannian.jpg",
    upvote: 0
  };
  const wangyun: raceService.IPlayer = {
    userId: "wangyun",
    nickname: "三年",
    logoUrl: "wangyun.jpg",
    upvote: 0
  };

  before(async function() {
    client = await getMongoClient();
    collRace = await getCollection(RACE);
    collPlayer = await getCollection(RACE_PLAYER);
    collUpvoter = await getCollection(RACE_UPVOTER);
    collUpvoteLog = await getCollection(RACE_UPVOTE_LOG);

    // 清理所有数据
    await Promise.all([
      collRace.deleteMany({}),
      collPlayer.deleteMany({}),
      collUpvoter.deleteMany({}),
      collUpvoteLog.deleteMany({})
    ]);

    let tong: userService.BasicInfo = {
      userId: "tong",
      nickname: "童",
      gender: "male"
    } as userService.BasicInfo;
    let jin: userService.BasicInfo = {
      userId: "jin",
      nickname: "金",
      gender: "male"
    } as userService.BasicInfo;
    await userService.add(tong);
    coinService.update("tong", 10000);
    await userService.add(jin);
    coinService.update("jin", 10);
  });

  after(async function() {
    await closeMongoClient();
  });

  // 新建一个比赛
  // 1 能查到这个比赛
  it("create race", async function() {
    await raceService.add("seed", 7, []);

    let data = await raceService.find("seed");
    assert(!!data);
    assert(data.status === raceService.RaceStatus.prepare);
  });

  // 能否打榜
  // 1 不存在race不能打榜
  // 2 不在race状态下,不能打榜
  it("can upvote", async function() {
    {
      let can = await raceService.canUpvote("seed2");
      assert(!can);
    }
    {
      let can = await raceService.canUpvote("seed");
      assert(!can);
    }
    {
      await raceService.start("seed");
      let can = await raceService.canUpvote("seed");
      assert(can);
    }
  });

  // 打榜
  // 1 tong打榜100coin给sannian
  // 2 sannian的热度变为200
  // 3 tong再次打榜100coin给sannian
  // 4 sannian的热度变为400
  // jin打榜10coin给sannian
  // 5 tong的打榜coin总额为200
  // 6 jin的打榜coin总额为10
  // tong打榜的流水记录为2条
  it("upvote", async function() {
    {
      await raceService.upvote("tong", "sannian", "seed", 100);
      let list = await raceService.playerList("seed", 100);
      assert(list && list[0].userId === "sannian" && list[0].upvote === 200);
    }
    {
      await raceService.upvote("tong", "sannian", "seed", 100);
      let list = await raceService.playerList("seed", 100);
      assert(list && list[0].userId === "sannian" && list[0].upvote === 400);
    }
    await raceService.upvote("jin", "sannian", "seed", 10);
    {
      let list = await raceService.upvoterList("seed", 10);
      assert(list && list[0].coin === 200 && list[1].coin === 10);
    }
    {
      let list = await collUpvoteLog.find({ userId: "tong" }).toArray();
      assert(list && list.length === 2);
    }
  });
});
