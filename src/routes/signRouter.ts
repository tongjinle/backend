import * as express from "express";
import * as protocol from "../protocol";
import * as signService from "../service/sign";
import * as userService from "../service/user";
import userCheck from "./role/userCheck";
import * as joi from "@hapi/joi";

let router = express.Router();

// check user role
router.use(userCheck);

// 今天是否签到
router.get("/isSign", async (req, res) => {
  let resData: protocol.IResIsSign;
  let reqData: protocol.IReqIsSign = req.query;

  let userId = req.header("userId");
  let today = new Date();
  let [year, month, day] = [
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ];
  let isSign: boolean = await signService.isSigned(userId, year, month, day);

  resData = { code: 0, isSign };
  res.json(resData);
});

// 签到
router.post("/", async (req, res) => {
  let resData: protocol.IResSign;
  let reqData: protocol.IReqSign = req.body;

  let userId = req.header("userId");
  let today = new Date();
  let [year, month, day] = [
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ];

  if (await signService.isSigned(userId, year, month, day)) {
    res.json({ code: -1, message: "今日已经签到" });
    return;
  }

  let coin: number = await signService.sign(userId, year, month, day);

  // 修改用户的coin
  userService.updateCoin(userId, coin);

  resData = { code: 0, coin };
  res.json(resData);
});

// 签到记录
router.get("/list", async (req, res) => {
  let resData: protocol.IResSignList;
  let reqData: protocol.IReqSignList = req.query;

  let userId = req.header("userId");
  let { year, month } = reqData;

  let result = joi.validate(
    { year, month },
    {
      year: joi.number().required(),
      month: joi.number().required()
    }
  );
  if (result.error) {
    res.json({ code: -1, message: "year或者month参数不合法" });
    return;
  }

  let list = await signService.signList(userId, year - 0, month - 0);

  let lastDay = new Date(year, month + 1, 0).getDate();
  let days = [];
  for (let i = 1; i <= lastDay; i++) {
    days.push(i);
  }
  let signed = list.map(n => n.day).sort((a, b) => a - b);
  resData = { code: 0, days, signed };
  res.json(resData);
});

export default router;
