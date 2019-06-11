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

export interface IReqReg {}
export interface IResReg extends IResErr {
  token: string;
}

export interface IReqFetch {}
export interface IResFetch extends IResErr {
  id?: string;
  type: "resource" | "coin";
  // 预览
  preview?: string[];
  // 资源链接
  url?: string;
  // 价格
  coin?: number;
  // 价格
  price?: number;
}

export interface IReqPassword {
  // 瓶子的id
  id: string;
}
export interface IResPassword extends IResErr {
  password: string;
}

export interface IReqCoin {}
export interface IResCoin extends IResErr {
  coin: number;
}

export interface IReqContribute {
  url: string;
}
export interface IResContribute extends IResErr {}

// export interface IReqReg {}
// export interface IResReg extends IResErr {}

// export interface IReqReg {}
// export interface IResReg extends IResErr {}

// export interface IReqReg {}
// export interface IResReg extends IResErr {}

// export interface IReqReg {}
// export interface IResReg extends IResErr {}
