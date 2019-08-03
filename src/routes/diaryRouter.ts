import * as express from "express";
import * as protocol from "../protocol";
import * as userService from "../service/user";
import * as diaryService from "../service/diary";
import userCheck from "./userCheck";
import * as joi from "@hapi/joi";

let router = express.Router();

// check user role
router.use(userCheck);

// 查询日记
router.get("/query", async (req, res) => {
  let resData: protocol.IResDiaryQuery;
  let reqData: protocol.IReqDiaryQuery = req.query;

  let data = await diaryService.find(reqData.id);

  resData = { code: 0, ...data };
  res.json(resData);
});

// 删除日记
router.post("/remove", async (req, res) => {
  let resData: protocol.IResDiaryRemove;
  let reqData: protocol.IReqDiaryRemove = req.bod;

  let id = reqData.id;
  let userId: string = req.header("userId");
  if (!(await diaryService.canRemove(id, userId))) {
    res.json({ code: -1, message: "删除日记失败" });
    return;
  }

  await diaryService.remove(id);

  resData = { code: 0 };
  res.json(resData);
});

// 打榜日记
router.post("/upvote", async (req, res) => {
  let resData: protocol.IResDiaryUpvote;
  let reqData: protocol.IReqDiaryUpvote = req.body;

  let id = reqData.id;
  let coin = reqData.coin;
  let userId: string = req.header("userId");

  //
  if (!(await diaryService.canUpvote(id, userId))) {
    res.json({ code: -1, message: "重复打榜" });
    return;
  }

  // coin检测
  let user = await userService.find(userId);
  if (!(user && user.coin >= coin)) {
    res.json({ code: -2, message: "代币不足" });
    return;
  }

  let diary = await diaryService.find(id);

  await diaryService.upvote(id, userId, coin);
  await userService.updateUpvote(diary.userId, userId, coin);

  resData = { code: 0 };
  res.json(reqData);
});

// 获取用户的日记列表
router.get("/list", async (req, res) => {
  let resData: protocol.IResDiaryList;
  let reqData: protocol.IReqDiaryList = req.query;

  let diaryUserId: string = reqData.userId;

  let list = await diaryService.list(diaryUserId);
  resData = { code: 0, list };
  res.json(resData);
});

export default router;
