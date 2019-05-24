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

export interface IReqScore {
  url: string;
  nickname: string;
  logoUrl: string;
}

export interface IResScore extends IResErr {
  id: string;
  // userId
  userId: string;
  // 微信昵称
  nickname: string;
  // 远程url
  url: string;
  // 得分
  score: number;
}
export interface IReqSort {}

export interface IResSort extends IResErr {
  list: {
    id: string;
    // userId
    userId: string;
    // 微信昵称
    nickname: string;
    // 远程url
    url: string;
    // 得分
    score: number;
  }[];
}
export interface IReqHistory {}

export interface IResHistory extends IResErr {
  list: {
    id: string;
    // userId
    userId: string;
    // 微信昵称
    nickname: string;
    // 远程url
    url: string;
    // 得分
    score: number;
  }[];
}
export interface IReqRemovePhoto {
  id: string;
}

export interface IResRemovePhoto extends IResErr {}
export interface IReqSearchPhoto {
  id: string;
}

export interface IResSearchPhoto extends IResErr {
  id: string;
  // userId
  userId: string;
  // 微信昵称
  nickname: string;
  // 远程url
  url: string;
  // 得分
  score: number;
}

export interface IReqLogin {
  code: string;
}

export interface IResLogin extends IResErr {
  userId: string;
  token: string;
}

export interface IReqUpdateUser {
  nickname: string;
}

export interface IResUpdateUser extends IResErr {}
