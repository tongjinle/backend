// *** 基础response格式
// *** 带有code[错误码]和msg[错误信息]
// *** 当code===0的时候,表示正确
export interface IResBase {
  // 错误码
  code: number;
  // 错误信息
  message?: string;
}

export interface IReqLogin {
  code: string;
}

export interface IResLogin extends IResBase {
  userId: string;
  token: string;
}

export interface IReqUpdateUser {
  // 背景图
  bgUrl?: string;
  // 生年
  // -1表示未设置
  birthYear?: number;
  // 城市
  city?: string;
  // 性别
  gender?: "female" | "male" | "unknow";
}

export interface IResUpdateUser extends IResBase {}

/**
 * 新增用户request数据结构
 */
export interface IReqAddUser {
  // id
  userId: string;
  // 昵称
  nickname: string;
  // 头像
  logoUrl: string;
  // 性别
  gender: "female" | "male" | "unknow";
  // 城市
  city: string;
}

export interface IResAddUser extends IResBase {}

/**
 * 用户信息request数据结构
 */
export interface IReqUserInfo {}

export interface IResUserInfo extends IResBase {
  userId: string;
  nickname: string;
  // 头像
  logoUrl: string;
  //
  bgUrl: string;
  // 生年
  // -1表示未设置
  birthYear: number;
  // 城市
  city: string;
  // 性别
  gender: "female" | "male" | "unknow";
  // 金币
  coin: number;
}

/**
 * 其他用户
 */
export interface IReqOtherUserInfo {
  userId: string;
}

export interface IResOtherUserInfo extends IResBase {
  userId: string;
  nickname: string;
  // 头像
  logoUrl: string;
  //
  bgUrl: string;
  // 生年
  // -1表示未设置
  birthYear: number;
  // 城市
  city: string;
  // 性别
  gender: "female" | "male" | "unknow";
  // 花费的金币
  upvotedCoin: number;
  // 被打赏的金币
  beUpvotedCoin: number;
}

/**
 * 签到
 */
export interface IReqSign {}
export interface IResSign extends IResBase {
  // 获得的coin
  coin: number;
}

/**
 * 今天是否签到
 */
export interface IReqIsSign {}
export interface IResIsSign extends IResBase {
  // 是否签到
  isSign: boolean;
}

/**
 * 签到记录
 */
export interface IReqSignList {
  // 年
  year: number;
  // 月,从0开始数
  month: number;
}
export interface IResSignList extends IResBase {
  // 当年当月的所有日子
  days: number[];
  // 当年当月的签到日子
  signed: number[];
}

/**
 * 分享
 */
export interface IReqShare {}
export interface IResShare extends IResBase {
  // 获得的coin
  coin: number;
}

export interface IReqShareReward {
  // 新用户的userId
  userId: string;
  // 分享者的userId
  sharerId: string;
  // 分享码
  shareCode: string;
}

export interface IResShareReward {}

export interface IReqNoticeList {}
export interface IResNoticeList extends IResBase {
  list: {
    id: string;
    // 文本
    text: string;
    // 金币数量
    coin?: number;
    // 通知类型
    // normal
    // back是退款
    // shareReward是转发成功获取用户的奖励
    type: "normal" | "back" | "shareReward" | "sendCoin";
    // 官方发放notice时候的时间戳
    timestamp: number;
    // 阅读的时间戳
    // 不存在该字段就是"未读"
    readTimestamp?: number;
  }[];
}

export interface IReqNoticeRead {
  id: string;
}
export interface IResNoticeRead extends IResBase {}

export interface IReqDiaryQuery {
  id: string;
}
export interface IResDiaryQuery extends IResBase {
  // 日记id
  id: string;
  // 用户编号
  userId: string;
  // 用户昵称
  nickname: string;
  // 头像
  logoUrl: string;
  // 照片地址(后期可能是视频等其他格式的media的url地址)
  url: string;
  // 类型
  type: "image" | "video" | "audio";
  // 得分(仅为image的时候存在)
  score?: number;
  // 简单文本
  text?: string;
  // 赞的次数
  upvote: number;
  // 打榜用掉的代币
  coin: number;
}

export interface IReqDiaryAdd {
  // 简单文本
  text: string;
  // 日记地址
  url: string;
  // 类型
  type: "image" | "video" | "audio";
  // 得分(仅为image的时候存在)
  score?: number;
}

export interface IResDiaryAdd extends IResBase {}

export interface IReqDiaryRemove {
  id: string;
}
export interface IResDiaryRemove extends IResBase {}

export interface IReqDiaryUpvote {
  // id
  id: string;
  // 打榜所消耗的coin
  coin: number;
}

export interface IResDiaryUpvote extends IResBase {}

export interface IReqDiaryList {
  userId: string;
}

export interface IResDiaryList extends IResBase {
  list: {
    // 日记id
    id: string;
    // 用户编号
    userId: string;
    // 照片地址(后期可能是视频等其他格式的media的url地址)
    url: string;
    // 类型
    type: "image" | "video" | "audio";
    // 得分(仅为photo的时候存在)
    score?: number;
    // 简单文本
    text?: string;
    // 赞的次数
    upvote: number;
    // 打榜用掉的代币
    coin: number;
  }[];
}

export interface IReqDiaryRecommendList {}

export interface IResDiaryRecommendList extends IResBase {
  list: {
    // 日记id
    id: string;
    // 用户编号
    userId: string;
    // 照片地址(后期可能是视频等其他格式的media的url地址)
    url: string;
    // 类型
    type: "image" | "video" | "audio";
    // 得分(仅为photo的时候存在)
    score?: number;
    // 简单文本
    text?: string;
    // 赞的次数
    upvote: number;
    // 打榜用掉的代币
    coin: number;
  }[];
}

export interface IReqAddRace {
  // 比赛名
  name: string;
  // 持续时间
  days: number;
  // 海报url列表
  postUrls: string[];
}

export interface IResAddRace extends IResBase {}

export interface IReqRaceList {
  // 比赛状态
  // 如果为空,则表示查询所有
  status?: "prepare" | "race" | "gameover";
}

export interface IResRaceList extends IResBase {
  list: {
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
    startTime?: Date;
    /**
     * 结束时间
     */
    endTime?: Date;
    /**
     * 海报地址(数组)
     */
    postUrls: string[];
    /**
     * 状态
     */
    status: "prepare" | "race" | "gameover";
    /**
     * 创建race的时间
     */
    time: Date;
  }[];
}

export interface IReqRemoveRace {
  // 比赛名
  name: string;
}

export interface IResRemoveRace extends IResBase {}

export interface IReqStartRace {
  // 比赛名
  name: string;
}

export interface IResStartRace extends IResBase {}

// 金主排行
export interface IReqRaceUpvoterList {
  // 比赛名
  name: string;
  // 个数限制
  limit: number;
}

export interface IResRaceUpvoterList extends IResBase {
  list: {
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
  }[];
}

export interface IReqRacePlayerList {
  // 比赛名
  name: string;
  // 个数限制
  limit: number;
}

// 比赛中选手排名
export interface IResRacePlayerList extends IResBase {
  list: {
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
  }[];
}

export interface IReqRaceInRace {}
export interface IResRaceInRace extends IResBase {
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
  startTimestamp?: number;
  /**
   * 结束时间
   */
  endTimestamp?: number;
  /**
   * 海报地址(数组)
   */
  postUrls: string[];
  /**
   * 状态
   */
  status: "prepare" | "race" | "gameover";
  /**
   * 创建race的时间
   */
  time: Date;
}

// 分享码
export interface IReqShareCode {}
export interface IResShareCode extends IResBase {
  shareCode: string;
}

// 是否已经注册
export interface IReqIsAddUser {
  userId: string;
}
export interface IResIsAddUser extends IResBase {
  isAdd: boolean;
}
