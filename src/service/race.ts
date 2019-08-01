import { getCollection } from "../getMongoClient";
import * as userService from "./user";
import { string } from "@hapi/joi";
import utils from "../utils";

/**
 * 比赛状态
 */
export enum RaceStatus {
  /**
   * 准备中,一般用于官方设置的准备状态
   */
  prepare = "prepare",
  /**
   * 准备完成,可以接受用户报名
   */
  ready = "ready",
  /**
   * 比赛进行中
   */
  race = "race",
  /**
   * 比赛已经结束
   */
  gameover = "gameover"
}

/**
 * 比赛设置
 */
export interface IRaceSetting {
  /**
   * 比赛名称
   */
  name: string;
  /**
   * 开始时间
   */
  startTime: Date;
  /**
   * 结束时间
   */
  endTime: Date;
  /**
   * 报名人数
   */
  count: number;
  /**
   * 海报地址(数组)
   */
  postUrls: string[];
  /**
   * 状态
   */
  status: RaceStatus;
}

/**
 * 比赛完全信息
 */
export interface IRace {
  /**
   * 设置
   */
  setting: IRaceSetting;
  /**
   * 参赛者列表
   */
  players: IPlayer[];
  /**
   * 打榜者列表
   */
  upvoters: IUpvoter[];
}

/**
 * 报名的状态
 */
export enum PlayerStatus {
  /**
   * 未知(官方尚未确定)
   */
  unknow = "unknow",
  accpet = "accpet",
  reject = "reject"
}

/**
 * 参赛玩家信息
 */
export interface IPlayer {
  /**
   * 参赛用户id
   */
  userId: string;
  /**
   * 昵称
   */
  nickName: string;
  /**
   * 头像url
   */
  avatarUrl: string;
  /**
   * 打榜热度
   */
  upvote: number;
  /**
   * 媒体列表
   */
  mediaUrls: string[];

  /**
   * 参赛者状态
   * @see PlayerStatus
   */
  status: PlayerStatus;
}

/**
 * 打榜用户信息
 */
export interface IUpvoter {
  /**
   * 参赛用户id
   */
  userId: string;
  /**
   * 昵称
   */
  nickName: string;
  /**
   * 头像url
   */
  avatarUrl: string;
  /**
   * 打榜热度
   */
  coin: number;
}

// 表名
const RACE = "race";
const RACE_PLAYER = "racePlayer";
const RACE_UPVOTER = "raceUpvoter";
const RACE_UPVOTE_LOG = "raceUpvoteLog";

/**
 * 创建比赛
 * @param setting 比赛信息
 */
export async function create(setting: IRaceSetting): Promise<void> {
  let coll = await getCollection(RACE);
  let fullSetting = {
    ...setting,
    status: RaceStatus.prepare,
    time: new Date()
  };
  await coll.insertOne(fullSetting);
}

/**
 * 寻找比赛
 * @param name 比赛名字
 */
export async function find(name: string): Promise<IRaceSetting> {
  let rst: IRaceSetting;
  let coll = await getCollection(RACE);
  rst = await coll.findOne({ name });
  return rst;
}

/**
 * 获取所有比赛
 * @returns 返回比赛名字的列表
 */
export async function list(status?: RaceStatus): Promise<string[]> {
  let rst: string[] = [];
  let coll = await getCollection(RACE);
  let query = status === undefined ? {} : { status };
  rst = (await coll.find(query).toArray()).map(n => n.name);
  return rst;
}

/**
 * 设置比赛进入ready状态
 * @param name 比赛名
 */
export async function ready(name: string): Promise<void> {
  let coll = await getCollection(RACE);
  await coll.updateOne({ name }, { $set: { status: RaceStatus.ready } });
}

/**
 * 设置比赛进入race状态
 * @param name 比赛名
 */
export async function start(name: string): Promise<void> {
  let coll = await getCollection(RACE);
  await coll.updateOne({ name }, { $set: { status: RaceStatus.race } });
}

/**
 * 设置比赛进入gameover状态
 * @param name 比赛名
 */
export async function gameover(name: string): Promise<void> {
  let coll = await getCollection(RACE);
  await coll.updateOne({ name }, { $set: { status: RaceStatus.gameover } });
}

/**
 * 能否报名
 * @param raceName 比赛名
 * @param userId 用户id
 */
export async function canRegister(
  raceName: string,
  userId: string
): Promise<boolean> {
  let rst: boolean;
  let collRace = await getCollection(RACE);
  let collPlayer = await getCollection(RACE_PLAYER);
  // 1 是否存在比赛,并且比赛处于ready状态
  if (!(await collRace.findOne({ name: raceName, status: RaceStatus.ready }))) {
    return false;
  }

  // 2 是否已经报名
  if (await collPlayer.findOne({ raceName, userId })) {
    return false;
  }

  rst = true;
  return rst;
}

/**
 * 用户报名
 * @param raceName 比赛名
 * @param userId 报名者id
 * @param mediaUrls 报名者媒体列表
 */
export async function register(
  raceName: string,
  player: IPlayer
): Promise<void> {
  let coll = await getCollection(RACE_PLAYER);
  await coll.insertOne({
    raceName,
    ...player,
    upvote: 0,
    status: PlayerStatus.unknow
  });
}

/**
 * 获取参赛用户
 * @param raceName 比赛名字
 */
export async function playerList(raceName: string): Promise<IPlayer[]> {
  let rst: IPlayer[] = [];
  let coll = await getCollection(RACE_PLAYER);
  let data = await coll.find({ raceName }).toArray();

  rst = data.map(n => {
    let item: IPlayer = {
      userId: n.userId,
      nickName: n.nickName,
      avatarUrl: n.avatarUrl,
      upvote: n.upvote,
      mediaUrls: n.mediaUrls,
      status: n.status
    };
    return item;
  });
  return rst;
}

/**
 *
 * @param raceName 比赛名
 * @param userId 参赛用户id
 */
export async function canSetPlayer(
  raceName: string,
  userId: string
): Promise<boolean> {
  let rst: boolean;

  let collRace = await getCollection(RACE);
  let collPlayer = await getCollection(RACE_PLAYER);
  // 1 是否存在比赛,并且比赛处于ready状态
  if (!(await collRace.findOne({ name: raceName, status: RaceStatus.ready }))) {
    return false;
  }

  // 2 应该已经报名
  if (!(await collPlayer.findOne({ raceName, userId }))) {
    return false;
  }

  rst = true;
  return rst;
}

/**
 * 新增参赛用户
 * @param raceName 比赛名
 * @param userId 参赛用户id
 */
export async function addPlayer(
  raceName: string,
  userId: string
): Promise<void> {
  let coll = await getCollection(RACE_PLAYER);
  coll.updateOne(
    { raceName, userId },
    { $set: { status: PlayerStatus.accpet } }
  );
}

/**
 * 新增参赛用户
 * @param raceName 比赛名
 * @param userId 参赛用户id
 */
export async function removePlayer(
  raceName: string,
  userId: string
): Promise<void> {
  let coll = await getCollection(RACE_PLAYER);
  coll.updateOne(
    { raceName, userId },
    { $set: { status: PlayerStatus.reject } }
  );
}

/**
 * 是否符合打榜的条件
 * @param userId 打榜用户id
 * @param playerId 参赛用户id(被打榜用户)
 * @param raceName 比赛名
 * @param coin 打榜消耗的代币
 */
export async function canUpvote(
  userId: string,
  playerId: string,
  raceName: string,
  coin: number
): Promise<boolean> {
  let rst: boolean;

  let collRace = await getCollection(RACE);
  let collPlayer = await getCollection(RACE_PLAYER);
  // 1 是否存在比赛,并且比赛处于race状态
  if (!(await collRace.findOne({ name: raceName, status: RaceStatus.race }))) {
    return false;
  }

  // 2 playerId应该已经报名,且被官方批准参赛
  if (
    !(await collPlayer.findOne({
      raceName,
      userId: playerId,
      status: PlayerStatus.accpet
    }))
  ) {
    return false;
  }

  // 3 是否有足够的coin
  let user = await userService.find(userId);
  if (!(user && user.coin >= coin)) {
    return false;
  }

  rst = true;
  return rst;
}

/**
 * 打榜
 * @param userId 打榜用户id
 * @param playerId 参赛用户id(被打榜用户)
 * @param raceName 比赛名
 * @param coin 打榜消耗的代币
 */
export async function upvote(
  userId: string,
  playerId: string,
  raceName: string,
  coin: number
): Promise<void> {
  let collPlayer = await getCollection(RACE_PLAYER);
  let collUpvoter = await getCollection(RACE_UPVOTER);
  let collUpvoteLog = await getCollection(RACE_UPVOTE_LOG);

  let hot = utils.upvoteCoin2Hot(coin);
  await collPlayer.updateOne(
    { raceName, userId: playerId },
    { $inc: { upvote: hot } }
  );
  await collUpvoter.updateOne(
    { raceName, userId },
    { $inc: { coin } },
    { upsert: true }
  );

  // 记录每笔upvote
  await collUpvoteLog.insertOne({ raceName, userId, coin, time: new Date() });
}

/**
 * 金主排行榜
 * @param raceName 比赛名
 * @param limit 个数限制
 */
export async function upvoterList(
  raceName: string,
  limit: number
): Promise<IUpvoter[]> {
  let rst: IUpvoter[] = [];
  let coll = await getCollection(RACE_UPVOTER);
  let data = await coll
    .find({ raceName })
    .sort({ coin: -1 })
    .limit(limit)
    .toArray();

  rst = data.map(n => {
    let item: IUpvoter = {
      userId: n.userId,
      nickName: n.nickName,
      avatarUrl: n.avatarUrl,
      coin: n.coin
    };
    return item;
  });

  return rst;
}

// let coll = await getCollection(RACE);
// ** 设置比赛(开始时间,结束时间,参赛人数,海报介绍)
// ** 开启比赛
// 用户报名
// 查看报名用户
// ** 新增参赛用户(需要微信,qq)
// ** 删除参赛用户
// 比赛积分榜
// 金主积分榜
// 给参赛用户打榜(点赞)
// 比赛现况统计(多少人参与,多少点赞,已经在第几天)
// !! 用户购买代币
// ?? 参赛用户上传媒体(目前是图片)
