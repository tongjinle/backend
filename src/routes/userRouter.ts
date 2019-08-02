import * as express from "express";
import * as protocol from "../protocol";
import * as joi from "@hapi/joi";
import errs from "../errCode";
import * as photoService from "../service/photo";
import * as userService from "../service/user";
import utils from "../utils";

let router = express.Router();

// check user role
router.use(async (req, res, next) => {
  let flag: boolean;
  flag = true;

  let userId: string = req.header("userId");
  let token: string = req.header("token");
  console.log({ userId, token });
  let result = joi.validate(
    { userId, token },
    {
      userId: joi.string().required(),
      token: joi.string().required()
    }
  );

  if (result.error) {
    res.json(errs.common.invalidParams);
    return;
  }

  if (token !== utils.getUserToken(userId)) {
    res.json(errs.common.wrongToken);
    return;
  }

  console.log("check user role:", flag);
  next();
});

// 新增用户
router.post("/add", async (req, res) => {
  let resData: protocol.IResAddUser;
  let reqData: protocol.IReqAddUser = req.body;

  let userId = req.header("userId");

  if (!(await userService.canAdd(userId))) {
    resData = { code: -1, message: "该用户已经存在" };
    res.json(resData);
    return;
  }

  let user: userService.BasicInfo = {
    userId,
    nickname: reqData.nickname,
    logoUrl: reqData.logoUrl,
    gender: reqData.gender,
    city: reqData.city
  };
  await userService.add(user);

  resData = { code: 0 };
  res.json(resData);
});

// 获取用户信息
router.get("/info", async (req, res) => {
  let resData: protocol.IResUserInfo;
  let reqData: protocol.IReqUserInfo;

  let userId = req.header("userId");
  let user = await userService.find(userId);

  if (!user) {
    res.json({ code: -1, message: "没有找到用户信息" });
    return;
  }

  resData = { code: 0, ...user };
  res.json(resData);
});

// 更新个人信息
router.post("/update/", async (req, res) => {
  let resData: protocol.IResUpdateUser;
  let reqData: protocol.IReqUpdateUser = req.body;
  let body: protocol.IReqUpdateUser = req.body;

  let userId: string = req.header("userId");

  if (Object.keys(reqData).length === 0) {
    resData = { code: -1, message: "没有修改的用户数据" };
    res.json(resData);
    return;
  }

  await userService.update(userId, reqData);

  resData = { code: 0 };
  res.json(resData);
});

export default router;
