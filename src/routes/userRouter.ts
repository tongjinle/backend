import * as express from "express";
import * as protocol from "../protocol";
import * as joi from "@hapi/joi";
import errs from "../errCode";
import * as photoService from "../service/photo";
let router = express.Router();

// check user role
router.use((req, res, next) => {
  let flag: boolean;
  flag = true;

  let userId: string = req.header["userId"];
  let token: string = req.header["token"];

  console.log("check user role:", flag);
  next();
});

// 颜值评分
router.post("/score/", async (req, res) => {
  let resData: protocol.IResScore;
  let body: protocol.IReqScore;

  let result = joi.validate(body, { url: joi.string().uri() });
  if (result.error) {
    res.json(errs.common.invalidParams);
    return;
  }

  let userId: string = req.header["userId"];
  let url: string = body.url;
  // todo
  // 在redis中查找
  let nickname = "小松鼠";
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
  let userId: string = req.header["userId"];
  let list = await photoService.history(userId);
  resData = { code: 0, list };
  res.json(resData);
});

// 删除我的照片
router.post("/remove/", (req, res) => {
  let resData: protocol.IResRemovePhoto;
  resData = { code: 0 };
  res.json(resData);
});
export default router;
