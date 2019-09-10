import * as express from "express";
import * as protocol from "../protocol";
import * as raceService from "../service/race";

let router = express.Router();

// check user role
router.use(function(req, res, next) {
  console.log("no check");
  next();
});

// 新增比赛
router.post("/add", async (req, res) => {
  console.log("in add");

  let reqData: protocol.IReqAddRace = req.body;
  let resData: protocol.IResAddRace;

  let { name, days, postUrls } = reqData;

  if (!(await raceService.canAdd(name))) {
    res.json({ code: -1, message: "比赛新增失败" });
    return;
  }

  await raceService.add(name, days, postUrls);
  resData = { code: 0 };
  res.json(resData);
});

// 周活动列表
router.get("/list", async (req, res) => {
  let reqData: protocol.IReqRaceList = req.query;
  let resData: protocol.IResRaceList;

  let status: raceService.RaceStatus = reqData.status as raceService.RaceStatus;

  let list: any = await raceService.list(status);
  resData = { code: 0, list };
  res.json(resData);
});

// 删除活动
router.post("/remove", async (req, res) => {
  let reqData: protocol.IReqRemoveRace = req.body;
  let resData: protocol.IResRemoveRace;

  let name: string = reqData.name;

  if (!(await raceService.canRemove(name))) {
    res.json({ code: -1, message: "不能删除比赛" });
    return;
  }

  await raceService.remove(name);
  resData = { code: 0 };
  res.json(resData);
});

// 开始活动
router.post("/start", async (req, res) => {
  let reqData: protocol.IReqStartRace = req.body;
  let resData: protocol.IResStartRace;

  let name: string = reqData.name;

  if (!(await raceService.canStart(name))) {
    res.json({ code: -1, message: "不能开始活动" });
    return;
  }

  await raceService.start(name);
  resData = { code: 0 };
  res.json(resData);
});

export default router;
