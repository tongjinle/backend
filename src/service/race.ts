import { getCollection } from "../getMongoClient";

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
  gameove = "gameover"
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
}

// 表名
const RACE = "race";
const RACE_PLAYER = "racePlayer";
const RACE_REGISTER = "raceRegister";

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

// 获取所有比赛

/**
 * 设置比赛进入ready状态
 * @param name 比赛名
 */
export async function ready(name: string): Promise<void> {
  let coll = await getCollection(RACE);
  await coll.updateOne({ name }, { status: RaceStatus.ready });
}

/**
 * 设置比赛进入race状态
 * @param name 比赛名
 */
export async function start(name: string): Promise<void> {
  let coll = await getCollection(RACE);
  await coll.updateOne({ name }, { status: RaceStatus.race });
}

/**
 * 用户报名
 * @param userId
 */
export async function register(
  raceName: string,
  userId: string
): Promise<void> {
  let coll = await getCollection(RACE_REGISTER);
  await coll.insertOne({ raceName, userId });
}

/**
 * 获取报名用户
 * @param raceName 比赛名字
 */
export async function registerList(raceName: string): Promise<string[]> {
  let coll = await getCollection(RACE_REGISTER);
  let data = (await coll.find({ raceName }).toArray()).map(n => n.userId);
  return data;
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
