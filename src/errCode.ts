interface IErr {
  code: number;
  message: string;
}

let errs = {
  common: {
    invalidParams: { code: 1, message: "不合法的参数" },
    wrongToken: {
      code: 2,
      message: "用户没有权限"
    }
  },
  photo: {
    noExists: { code: 101, message: "不存在该照片" },
    saveFail: {
      code: 102,
      message: "保存图片失败"
    },
    notOwner: { code: 103, message: "不是照片所有人" }
  },
  user: {}
};

export default errs;
