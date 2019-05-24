import * as express from "express";
import * as protocol from "../protocol";
import "@hapi/joi";
import axios from "axios";
import * as userService from "../service/user";
import config from "../config";
import * as request from "request";

let router = express.Router();

let appId: string = config.wx.appId;
let appSecret: string = config.wx.appSecret;

let wxUrl = "https://api.puman.xyz/commonApi/wx/openId";
// 登录
router.get("/login/", async (req, res) => {
  let resData: protocol.IResLogin;
  let query: protocol.IReqLogin = req.query;
  let { code } = query;
  let url =
    wxUrl +
    "?" +
    "appId=" +
    appId +
    "&" +
    "appSecret=" +
    appSecret +
    "&" +
    "code=" +
    code;
  try {
    let openId: string = await new Promise(resolve => {
      request.get(url, (err, res) => {
        console.log(url);
        if (err) {
          console.log(err);
          resolve("");
          return;
        }
        let data =
          typeof res.body === "string" ? JSON.parse(res.body) : res.body;
        resolve(data.openId);
      });
    });
    console.log({ openId });
    if (openId === "") {
      res.json({ code: 800 });
      return;
    }
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
