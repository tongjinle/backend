import assert = require("assert");
import { Collection, MongoClient } from "mongodb";
import {
  closeMongoClient,
  getCollection,
  getMongoClient
} from "../../getMongoClient";
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
    nickName: "三年",
    avatarUrl: "sannian.jpg",
    mediaUrls: ["1.jpg", "2.jpg"],
    upvote: 0,
    status: raceService.PlayerStatus.unknow
  };
  const wangyun: raceService.IPlayer = {
    userId: "wangyun",
    nickName: "三年",
    avatarUrl: "wangyun.jpg",
    mediaUrls: ["11.jpg", "12.jpg"],
    upvote: 0,
    status: raceService.PlayerStatus.unknow
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
    let setting: raceService.IRaceSetting = {
      name: "seed",
      startTime: new Date(2000, 0, 1),
      endTime: new Date(2000, 1, 1),
      count: 2,
      postUrls: [],
      status: raceService.RaceStatus.prepare
    };
    await raceService.create(setting);

    let data = await raceService.find("seed");
    assert(!!data);
    assert(data.status === raceService.RaceStatus.prepare);
  });

  // 能否报名
  // 1 不在ready状态的race不能报名
  // 2 在ready状态的race可以报名
  // 3 报名之后,不能重复报名
  // 4 不存在的race自然不能报名
  it("can register", async function() {
    // 1
    let can = await raceService.canRegister("seed", "sannian");
    assert(can === false);

    // 用户报名
    // 2
    await raceService.ready("seed");
    {
      let can = await raceService.canRegister("seed", "sannian");
      assert(can);
    }

    // 3
    {
      await raceService.register("seed", sannian);
      let can = await raceService.canRegister("seed", "sannian");
      assert(!can);
    }

    // 4
    {
      let can = await raceService.canRegister("seed2", "sannian");
      assert(!can);
    }
  });

  // 能否处理用户
  // 1 sannian已经报名,可以处理
  // 2 不存在的比赛不能处理
  // 3 未报名的用户sannian2不能处理
  it("canSetPlayer", async function() {
    let can = await raceService.canSetPlayer("seed", "sannian");
    assert(can);

    {
      let can = await raceService.canSetPlayer("seed2", "sannian");
      assert(!can);
    }

    {
      let can = await raceService.canSetPlayer("seed", "sannian2");
      assert(!can);
    }
  });

  // 选择报名用户
  it("addPlayer", async function() {
    await raceService.addPlayer("seed", "sannian");
    let user = await collPlayer.findOne({ userId: "sannian" });
    assert(user && user.status === raceService.PlayerStatus.accpet);
  });

  // 拒绝报名用户
  it("removePlayer", async function() {
    await raceService.register("seed", wangyun);
    await raceService.removePlayer("seed", "wangyun");
    let user = await collPlayer.findOne({ userId: "wangyun" });
    assert(user && user.status === raceService.PlayerStatus.reject);

    // 后面要使用到王云
    await raceService.addPlayer("seed", "wangyun");
  });

  // 能否打榜
  // 1 不在race状态下,不能打榜
  // 1.5 race状态下可以打榜
  // 2 不存在race不能打榜
  // 3 不存在player不能打榜
  // 4 钱不够不能打榜
  it("can upvote", async function() {
    {
      let can = await raceService.canUpvote("tong", "sannian", "seed", 100);
      assert(!can);
    }
    {
      await raceService.start("seed");
      let can = await raceService.canUpvote("tong", "sannian", "seed", 100);
      assert(can);
    }
    {
      let can = await raceService.canUpvote("tong", "sannian", "seed2", 100);
      assert(!can);
    }
    {
      let can = await raceService.canUpvote("tong", "sannian2", "seed", 100);
      assert(!can);
    }
    {
      let can = await raceService.canUpvote("jin", "sannian", "seed", 100);
      assert(!can);
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
      let list = await raceService.playerList("seed");
      assert(list && list[0].userId === "sannian" && list[0].upvote === 200);
    }
    {
      await raceService.upvote("tong", "sannian", "seed", 100);
      let list = await raceService.playerList("seed");
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
