import "@hapi/joi";
import * as express from "express";
import * as protocol from "../protocol";
import * as userService from "../service/user";

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
