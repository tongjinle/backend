import * as express from "express";
import * as protocol from "../protocol";
import * as userService from "../service/user";
import * as diaryService from "../service/diary";
import userCheck from "./userCheck";
import * as joi from "@hapi/joi";
import { MediaType } from "express-serve-static-core";

let router = express.Router();

// check user role
router.use(userCheck);

// 新增日记
router.post("/add", async (req, res) => {
  let resData: protocol.IResDiaryAdd;
  let reqData: protocol.IReqDiaryAdd = req.body;

  let userId: string = req.header("userId");

  let text = reqData.text || "";
  let url = reqData.url;
  let type = reqData.type as diaryService.MediaType;
  let score = reqData.score || -1;

  await diaryService.add(userId, text, url, type, score);
  resData = { code: 0 };
  res.json(resData);
});

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
  let reqData: protocol.IReqDiaryRemove = req.body;

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
  console.log({ usercoin: user.coin, coin });
  if (!(user && user.coin >= coin)) {
    res.json({ code: -2, message: "代币不足" });
    return;
  }

  let diary = await diaryService.find(id);

  await diaryService.upvote(id, userId, coin);
  await userService.updateUpvote(diary.userId, userId, coin);
  await userService.updateCoin(userId, -coin);

  resData = { code: 0 };
  res.json(resData);
});

// 获取用户的日记列表
router.get("/list", async (req, res) => {
  let resData: protocol.IResDiaryList;
  let reqData: protocol.IReqDiaryList = req.query;

  let diaryUserId: string = reqData.userId;
  console.log({ diaryUserId });

  let list = await diaryService.list(diaryUserId);
  resData = { code: 0, list };
  res.json(resData);
});

export default router;
