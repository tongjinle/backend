import * as express from "express";
import * as protocol from "../protocol";
import * as joi from "@hapi/joi";
import errs from "../errCode";
import * as photoService from "../service/photo";
import * as userService from "../service/user";

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

  if (token !== (await userService.getToken(userId))) {
    res.json(errs.common.wrongToken);
    return;
  }

  console.log("check user role:", flag);
  next();
});

// 更新个人信息
router.post("/update/", async (req, res) => {
  let resData: protocol.IResUpdateUser;
  let body: protocol.IReqUpdateUser = req.body;

  let userId: string = req.header("userId");
  let nickname = body.nickname;
  let flag = await userService.updateUser(userId, { nickname });

  resData = { code: 0 };

  res.json(resData);
});

// 颜值评分
router.post("/score/", async (req, res) => {
  let resData: protocol.IResScore;
  let body: protocol.IReqScore = req.body;

  let result = joi.validate(body, { url: joi.string().uri() });
  if (result.error) {
    res.json(errs.common.invalidParams);
    return;
  }

  let userId: string = req.header("userId");
  let url: string = body.url;

  let user = await userService.getUser(userId);
  let nickname = user.nickname;
  let photo = await photoService.save(userId, url, nickname);

  if (!photo) {
    res.json(errs.photo.saveFail);
    return;
  }

  resData = Object.assign({ code: 0 }, photo);
  res.json(resData);
});

// 我的历史照片
router.get("/history/", async (req, res) => {
  let resData: protocol.IResHistory;
  let userId: string = req.header("userId");
  let list = await photoService.history(userId);
  resData = { code: 0, list };
  res.json(resData);
});

// 删除我的照片
router.post("/remove/", async (req, res) => {
  let resData: protocol.IResRemovePhoto;
  let body: protocol.IReqRemovePhoto = req.body;

  let result = joi.validate(body, { id: joi.string().required() });

  if (result.error) {
    res.json(errs.common.invalidParams);
    return;
  }

  let userId: string = req.header("userId");
  let id: string = body.id;

  // 判断是不是照片所有人
  let flag = await photoService.checkOwner(userId, id);
  if (!flag) {
    res.json(errs.photo.notOwner);
    return;
  }

  await photoService.remove(id);

  resData = { code: 0 };
  res.json(resData);
});
export default router;
