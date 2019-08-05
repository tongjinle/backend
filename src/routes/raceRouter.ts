import * as express from "express";
import * as protocol from "../protocol";
import * as raceService from "../service/race";
import { json } from "body-parser";
import userCheck from "./userCheck";

let router = express.Router();

// check user role
router.use(userCheck);

// 选手排行
router.get("/player", async (req, res) => {
  let reqData: protocol.IReqRacePlayerList = req.query;
  let resData: protocol.IResRacePlayerList;

  let name = reqData.name;

  let list = await raceService.playerList(name);

  resData = { code: 0, list };
  res.json(resData);
});

// 金主排行
router.get("/upvoter", async (req, res) => {
  let reqData: protocol.IReqRaceUpvoterList = req.query;
  let resData: protocol.IResRaceUpvoterList;

  let name = reqData.name;
  let limit = reqData.limit;
  let list = await raceService.upvoterList(name, limit);

  resData = { code: 0, list };
  res.json(resData);
});

export default router;
