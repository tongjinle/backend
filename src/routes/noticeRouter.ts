import * as express from "express";
import * as protocol from "../protocol";
import * as noticeService from "../service/notice";
import userCheck from "./userCheck";

let router = express.Router();

// check user role
router.use(userCheck);

// 新增用户
router.get("/list", async (req, res) => {
  let resData: protocol.IResNoticeList;
  let reqData: protocol.IReqNoticeList;

  let userId = req.header("userId");

  let list = await noticeService.list(userId);
  resData = { code: 0, list };
  res.json(resData);
});

// 标记通知已读
router.post("/read", async (req, res) => {
  let resData: protocol.IResNoticeRead;
  let reqData: protocol.IReqNoticeRead = req.body;

  let userId = req.header("userId");
  let noticeId = reqData.id;

  if (!(await noticeService.canAction(noticeId, userId))) {
    res.json({ code: -1, message: "缺少标记权限" });
    return;
  }

  await noticeService.read(userId);

  resData = { code: 0 };
  res.json(resData);
});

export default router;
