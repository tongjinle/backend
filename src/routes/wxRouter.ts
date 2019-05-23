import * as express from "express";
import * as protocol from "../protocol";
import "@hapi/joi";
import axios from "axios";
import * as userService from "../service/user";

let router = express.Router();

let appId: string;
let appSecret: string;

let wxUrl = "https://api.puman.xyz/commonApi/wx/";
// 登录
router.post("/login/", async (req, res) => {
  let resData: protocol.IResLogin;
  let body: protocol.IReqLogin = req.body;
  let { code } = body;
  try {
    let wxRes = await axios.get(wxUrl, {
      data: { appId, appSecret, code }
    });
    let openId = wxRes.data.openId;
    let token = await userService.getToken(openId);
    // 直接在数据库addUser
    await userService.addUser(openId);

    resData = { code: 0, userId: openId, token };
  } catch (e) {
    console.log(e);
    res.json({ code: 900 });
    return;
  }

  res.json(resData);
});
export default router;
