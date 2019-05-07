import { Timestamp } from "bson";

// *** 基础response格式
// *** 带有code[错误码]和msg[错误信息]
// *** 当code===undefined的时候,表示正确
export interface IResErr {
  // 错误码
  code?: number;
  // 错误信息
  message?: string;
}

export interface IReqToken {
  code: string;
}

export interface IResToken {
  token: string;
}

export interface IReqPicList {
  name: string;
  pageSize: number;
  pageIndex: number;
}

export interface IResPicList extends IResErr {
  list: {
    id: string;
    url: string;
    name: string;
    timestamp: number;
  }[];
}

export interface IReqPicCount {}

export interface IResPicCount extends IResErr {
  list: {
    name: string;
    logo: string;
    count: number;
  }[];
}
export interface IReqPicInfoBeforeCheck {
  pageSize: number;
  pageIndex: number;
}

export interface IResPicInfoBeforeCheck extends IResErr {
  list: {
    id: string;
    url: string;
    isPorn: boolean;
    isPorn2: boolean;
    isGirl: boolean;
    isGirl2: boolean;
  }[];
}
export interface IReqPicInfoAfterCheck {
  pageSize: number;
  pageIndex: number;
}

export interface IResPicInfoAfterCheck extends IResErr {
  list: {
    id: string;
    url: string;
    isPorn: boolean;
    isPorn2: boolean;
    isGirl: boolean;
    isGirl2: boolean;
  }[];
}

export interface IReqPicSetIsGirl {
  nameList: string[];
  isGirl: boolean;
}
export interface IResPicSetIsGirl {}
export interface IReqPicSetIsPorn {
  nameList: string[];
  isPorn: boolean;
}
export interface IResPicSetIsPorn {}
