import * as express from "express";
import * as protocol from "../protocol";
import { sort } from "../service/photo";
let router = express.Router();

// 排行榜
router.get("/sort/", async (req, res) => {
  let resData: protocol.IResSort;
  let list = await sort();
  resData = { code: 0, list };
  res.json(resData);
});

// 通过id查看某张照片
router.get("/search/", (req, res) => {
  let resData: protocol.IResSearchPhoto;

  resData = {
    code: 0,
    id: "#123abc2",
    userId: "tongjinle2",
    url: "http://www.baid2",
    score: 87,
    nickname: "小松鼠2"
  };
  res.json(resData);
});
export default router;
