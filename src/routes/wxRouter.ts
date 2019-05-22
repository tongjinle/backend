import * as express from "express";
import * as protocol from "../protocol";
import "@hapi/joi";
import * as Joi from "@hapi/joi";
import axios from "axios";
let router = express.Router();

let appId: string;
let appSecret: string;

let wxUrl = "https://api.puman.xyz/commonApi/wx/";
// 登录
router.post("/login/", async (req, res) => {
  let resData: protocol.IResLogin;
  let body: protocol.IReqLogin = req.body;
  let { code, nickname } = body;
  try {
    let wxRes = await axios.get(wxUrl, {
      data: { appId, appSecret, code }
    });
    let openId = wxRes.data.openId;
  } catch (e) {
    console.log(e);
    res.json({ code: 900 });
    return;
  }
  resData = { code: 0, openId: "aaa" };

  res.json(resData);
});
export default router;
