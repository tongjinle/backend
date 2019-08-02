import { inflate } from "zlib";

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
