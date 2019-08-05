import { getCollection } from "../getMongoClient";
import utils from "../utils";
import * as userService from "./user";

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
   * 比赛周期(以日为单位)
   */
  days: number;
  /**
   * 开始时间
   */
  startTime: Date;
  /**
   * 结束时间
   */
  endTime: Date;
  /**
   * 海报地址(数组)
   */
  postUrls: string[];
  /**
   * 状态
   */
  status: RaceStatus;
  /**
   * 创建race的时间
   */
  time: Date;
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
  logoUrl: string;
  /**
   * 打榜热度
   */
  upvote: number;
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
  logoUrl: string;
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

export async function canAdd(name: string): Promise<boolean> {
  let rst: boolean;
  let coll = await getCollection(RACE);

  if (!!(await coll.findOne({ name }))) {
    return false;
  }

  rst = true;
  return rst;
}

/**
 * 创建比赛
 * @param name 比赛名
 * @param days 持续的日子
 * @param postUrls 海报url列表
 */
export async function add(
  name: string,
  days: number,
  postUrls: string[]
): Promise<void> {
  let coll = await getCollection(RACE);
  let fullSetting = {
    name,
    days,
    postUrls,
    status: RaceStatus.prepare,
    time: new Date()
  };
  await coll.insertOne(fullSetting);
}

/**
 * 能否删除比赛
 * @param name 比赛名
 */
export async function canRemove(name: string): Promise<boolean> {
  let rst: boolean;
  let coll = await getCollection(RACE);

  if (!(await coll.findOne({ name, status: "prepare" }))) {
    return false;
  }
  rst = true;
  return rst;
}

/**
 * 删除比赛
 * @param name 比赛名
 */
export async function remove(name: string): Promise<void> {
  let coll = await getCollection(RACE);
  await coll.deleteOne({ name });
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

export async function findInRace(): Promise<IRaceSetting> {
  let rst: IRaceSetting;
  let coll = await getCollection(RACE);
  rst = await coll.findOne({ status: RaceStatus.race });
  return rst;
}

/**
 * 获取所有比赛
 * @returns 返回比赛名字的列表
 */
export async function list(status?: RaceStatus): Promise<IRaceSetting[]> {
  let rst: IRaceSetting[] = [];
  let coll = await getCollection(RACE);
  let query = status === undefined ? {} : { status };
  rst = await coll.find(query).toArray();
  return rst;
}

/**
 * 能否开始一个比赛
 * @param name 比赛名
 */
export async function canStart(name: string): Promise<boolean> {
  let rst: boolean;
  // 1 比赛存在,而且比赛的状态为prepare
  let coll = await getCollection(RACE);
  let race = await find(name);
  if (!(race && race.status === RaceStatus.prepare)) {
    return false;
  }

  // 2 没有其他比赛处于race状态中(因为只能有一个比赛在race状态下)
  let other = await coll.findOne({
    name: { $ne: name },
    status: RaceStatus.race
  });
  if (other) {
    return false;
  }

  rst = true;
  return rst;
}

/**
 * 设置比赛进入race状态
 * @param name 比赛名
 */
export async function start(name: string): Promise<void> {
  let race = await find(name);
  let startTime: Date = new Date();
  let endTime: Date = new Date(
    startTime.getFullYear(),
    startTime.getMonth(),
    startTime.getDate() + race.days
  );

  let coll = await getCollection(RACE);
  await coll.updateOne(
    { name },
    { $set: { status: RaceStatus.race, startTime, endTime } }
  );
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
 * 是否符合打榜的条件
 * @param userId 打榜用户id
 * @param playerId 参赛用户id(被打榜用户)
 * @param raceName 比赛名
 * @param coin 打榜消耗的代币
 */
export async function canUpvote(raceName: string): Promise<boolean> {
  let rst: boolean;

  let collRace = await getCollection(RACE);
  let collPlayer = await getCollection(RACE_PLAYER);
  // 1 是否存在比赛,并且比赛处于race状态
  if (!(await collRace.findOne({ name: raceName, status: RaceStatus.race }))) {
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
  // 记录参赛选手
  {
    let op: any = { $inc: { upvote: hot } };
    if (!(await collPlayer.findOne({ raceName, userId: playerId }))) {
      let user = await userService.find(playerId);
      let nickName = user.nickname;
      let logoUrl = user.logoUrl;
      op = { ...op, $set: { nickName, logoUrl } };
    }

    await collPlayer.updateOne({ raceName, userId: playerId }, op, {
      upsert: true
    });
  }

  // 记录打榜金主
  {
    let op: any = { $inc: { coin } };
    if (!(await collUpvoter.findOne({ raceName, userId }))) {
      let user = await userService.find(userId);
      let nickName = user.nickname;
      let logoUrl = user.logoUrl;
      op = { ...op, $set: { nickName, logoUrl } };
    }
    await collUpvoter.updateOne({ raceName, userId }, op, { upsert: true });
  }

  // 记录每笔upvote
  await collUpvoteLog.insertOne({ raceName, userId, coin, time: new Date() });
}

/**
 * 获取参赛用户
 * @param raceName 比赛名字
 * @param limit 个数限制
 */
export async function playerList(
  raceName: string,
  limit: number
): Promise<IPlayer[]> {
  let rst: IPlayer[] = [];
  let coll = await getCollection(RACE_PLAYER);
  let data = await coll
    .find({ raceName })
    .sort({ upvote: -1 })
    .limit(limit)
    .toArray();

  rst = data.map(n => {
    let item: IPlayer = {
      userId: n.userId,
      nickName: n.nickName,
      logoUrl: n.avatarUrl,
      upvote: n.upvote
    };
    return item;
  });
  return rst;
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
      logoUrl: n.avatarUrl,
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
