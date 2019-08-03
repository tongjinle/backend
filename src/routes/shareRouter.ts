import * as express from "express";
import * as protocol from "../protocol";
import * as shareService from "../service/share";
import userCheck from "./userCheck";
import * as joi from "@hapi/joi";

let router = express.Router();

// check user role
router.use(userCheck);

// 记录分享
router.post("/", async (req, res) => {
  let resData: protocol.IResShare;
  let reqData: protocol.IReqShare = req.body;

  let userId = req.header("userId");

  let today = new Date();
  let [year, month, day] = [
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ];

  let isShare: boolean = await shareService.isShared(userId, year, month, day);
  if (isShare) {
    res.json({ code: -1, message: "已经获得分享奖励" });
    return;
  }

  let coin = await shareService.share(userId, year, month, day);

  resData = { code: 0, coin };
  res.json(resData);
});

// 分享获得新用户的奖励
router.post("/reward", async (req, res) => {
  let resData: protocol.IResShareReward;
  let reqData: protocol.IReqShareReward = req.body;

  let userId = req.header("userId");
  let today = new Date();
  let [year, month, day] = [
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ];

  let result = joi.validate(reqData, {
    sharerId: joi.string().required(),
    shareCode: joi.string().required()
  });
  if (result.error) {
    res.json({ code: -1, message: "分享者userId或者分享码参数错误" });
    return;
  }

  let sharerId: string = reqData.sharerId;
  let shareCode: string = reqData.shareCode;

  if (!(await shareService.isShareCodeValid(sharerId, shareCode))) {
    res.json({ code: -2, message: "分享码不合法" });
    return;
  }

  if (await shareService.isRewarded(userId, sharerId)) {
    res.json({ code: -3, message: "已经奖励过该新用户分享" });
    return;
  }

  let coin: number = await shareService.reward(userId, sharerId);
  resData = { code: 0, coin };
  res.json(resData);

  // 官方通知
  // todo
});

export default router;
