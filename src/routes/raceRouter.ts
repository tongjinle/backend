import * as express from "express";
import * as protocol from "../protocol";
import * as raceService from "../service/race";

let router = express.Router();

// check user role
router.use(function(req, res, next) {});

// 新增用户
router.post("/add", async (req, res) => {
  let reqData: protocol.IReqAddRace = req.body;
  let resData: protocol.IResAddRace;

  let { name, days, postUrls } = reqData;

  await raceService.add(name, days, postUrls);
});

export default router;
