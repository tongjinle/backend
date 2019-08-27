import * as joi from "@hapi/joi";
import * as express from "express";
import * as protocol from "../protocol";
import * as raceService from "../service/race";
import * as userService from "../service/user";
import userCheck from "./userCheck";
import { getRedisClient } from "../redis";
import * as redisKey from "../redisKey";

let router = express.Router();

// check user role
router.use(userCheck);

router.get("/current", async (req, res) => {
  let reqData: protocol.IReqRaceInRace = req.query;
  let resData: protocol.IResRaceInRace;
  let race = await raceService.findInRace();

  if (!race) {
    res.json({ code: -1, message: "没有当前比赛" });
    return;
  }

  resData = {
    code: 0,
    ...race,
    status: race.status as any,
    startTimestamp: race.startTime.getTime(),
    endTimestamp: race.endTime.getTime()
  };
  res.json(resData);
});

// 某个选手的热度
router.get("/hot", async (req, res) => {
  let reqData: protocol.IReqRacePlayer = req.query;
  let resData: protocol.IResRacePlayer;
  let { playerId } = reqData;

  let hot = -1;
  {
    let client = await getRedisClient();
    let key = redisKey.hot(playerId);
    if (!(await client.get(key))) {
      let race = await raceService.findInRace();
      if (race) {
        let raceName = race.name;
        let player = await raceService.findPlayer(raceName, playerId);
        if (player) {
          hot = player.upvote;
          await client.set(key, hot.toString());
        }
      }
    } else {
      hot = parseInt(await client.get(key));
    }
  }
  resData = { code: 0, hot };
  res.json(resData);
});

// 选手排行
router.get("/player", async (req, res) => {
  let reqData: protocol.IReqRacePlayerList = req.query;
  let resData: protocol.IResRacePlayerList;

  let result = joi.validate(reqData, {
    name: joi.string().required(),
    limit: joi.number().required()
  });
  if (result.error) {
    res.json({ code: -1, message: "参数格式不正确" });
    console.error(result.error);
    return;
  }

  let name = reqData.name;
  let limit: number = Math.min(20, reqData.limit - 0);
  let list: any = await raceService.playerList(name, limit);
  console.log({ list });
  // list = await Promise.all(
  //   list.map(async n => {
  //     let user = await userService.find(n.userId);
  //     n.nickname = user.nickname;
  //     n.logoUrl = user.logoUrl;
  //     return n;
  //   })
  // );

  resData = { code: 0, list };
  res.json(resData);
});

// 金主排行
router.get("/upvoter", async (req, res) => {
  let reqData: protocol.IReqRaceUpvoterList = req.query;
  let resData: protocol.IResRaceUpvoterList;

  let result = joi.validate(reqData, {
    name: joi.string().required(),
    limit: joi.number().required()
  });
  if (result.error) {
    res.json({ code: -1, message: "参数格式不正确" });
    console.error(result.error);
    return;
  }

  let name = reqData.name;
  let limit: number = Math.min(20, reqData.limit - 0);
  let list: any = await raceService.upvoterList(name, limit);

  resData = { code: 0, list };
  res.json(resData);
});

export default router;
