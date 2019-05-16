import { Timestamp } from "bson";

// *** 基础response格式
// *** 带有code[错误码]和msg[错误信息]
// *** 当code===undefined的时候,表示正确
export interface IResErr {
  // 错误码
  code: number;
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
export interface IReqPicProList {
  status: -1 | 0 | 1;
  pageSize: number;
  pageIndex: number;
}

export interface IResPicProList extends IResErr {
  list: {
    id: string;
    // 图片地址
    url: string;
    // 女孩名字
    name: string;
    // 时间戳
    timestamp: number;
    // ai是否建议使用该图片
    // 0表示不建议,1表示建议
    suggest: 0 | 1;
  }[];
  // 总数量
  total: number;
}

export interface IReqPicSetStatus {
  id: string;
  status: -1 | 0 | 1;
}

export interface IResPicSetStatus extends IResErr {}
