import * as express from "express";
import * as protocol from "../protocol";
let router = express.Router();

// check user role
router.use((req, res, next) => {
  let flag: boolean;
  flag = true;

  let userId: string = req.header["userId"];
  let token: string = req.header["token"];

  console.log("check user role:", flag);
  next();
});

// 颜值评分
router.post("/score/", (req, res) => {
  let resData: protocol.IResScore;
  resData = {
    code: 0,
    id: "#123abc",
    userId: "tongjinle",
    url: "http://www.baid",
    score: 88,
    nickname: "小松鼠"
  };
  res.json(resData);
});

// 我的历史照片
router.get("/history/", (req, res) => {
  let resData: protocol.IResHistory;
  let list = [
    {
      id: "#123abc",
      userId: "tongjinle",
      url: "http://www.baid",
      score: 88,
      nickname: "小松鼠"
    },
    {
      id: "#123abc2",
      userId: "tongjinle2",
      url: "http://www.baid2",
      score: 87,
      nickname: "小松鼠2"
    }
  ];
  resData = { code: 0, list };
  res.json(resData);
});

// 删除我的照片
router.post("/remove/", (req, res) => {
  let resData: protocol.IResRemovePhoto;
  resData = { code: 0 };
  res.json(resData);
});
export default router;
