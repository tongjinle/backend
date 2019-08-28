import "@hapi/joi";
import * as express from "express";
import * as protocol from "../protocol";
import * as userService from "../service/user";
import * as postService from "../service/post";

let router = express.Router();

// 登录
router.get("/isAddUser/", async (req, res) => {
  let resData: protocol.IResIsAddUser;
  let reqData: protocol.IReqIsAddUser = req.query;

  let isAdd = !!(await userService.find(reqData.userId));
  resData = { code: 0, isAdd };
  res.json(resData);
});
export default router;

// 获取当前海报
router.get("/posts", async (req, res) => {
  let list = await postService.list("using");
  let posts = list && list.length ? list[0] : undefined;
  if (!posts) {
    res.json({ code: -1, message: "没有找到海报套餐" });
    return;
  }
  res.json({ code: 0, ...posts });
});
