import * as express from "express";
import * as protocol from "../protocol";
import * as noticeService from "../service/notice";
import userCheck from "./role/userCheck";
import * as joi from "@hapi/joi";

let router = express.Router();

// check user role
router.use(userCheck);

// 通知列表
router.get("/list", async (req, res) => {
  let resData: { list: noticeService.INotice[] } & protocol.IResBase;
  let reqData: {};

  let userId = req.header("userId");

  let list = await noticeService.list(userId);
  resData = { code: 0, list };
  res.json(resData);
});

// 标记通知已读
router.post("/read", async (req, res) => {
  let resData: {} & protocol.IResBase;
  let reqData: { id: string } = req.body;

  let userId = req.header("userId");
  {
    let result = joi.validate(reqData, {
      id: joi.string().required()
    });
    if (result.error) {
      res.json({ code: -1, message: "参数格式不正确" });
      console.error(result.error);
      return;
    }
  }
  let noticeId = reqData.id;

  if (!(await noticeService.canAction(noticeId, userId))) {
    res.json({ code: -1, message: "缺少标记权限" });
    return;
  }

  await noticeService.read(noticeId);

  resData = { code: 0 };
  res.json(resData);
});

export default router;
