interface IErr {
  code: number;
  message: string;
}

let errs = {
  photo: {
    noExists: { code: 101, message: "不存在该照片" }
  }
};

export default errs;
