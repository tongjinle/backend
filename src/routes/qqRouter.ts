import "@hapi/joi";
import * as express from "express";
import * as request from "request";
import config from "../config";
import * as protocol from "../protocol";
import * as userService from "../service/user";
import utils from "../utils";

let router = express.Router();

let appId: string = config.qq.appId;
let appSecret: string = config.qq.appSecret;

let openIdUrl = config.qqOpenIdUrl;
// 登录
router.get("/login/", async (req, res) => {
  let resData: protocol.IResLogin;
  let query: protocol.IReqLogin = req.query;
  let { code } = query;
  let url =
    openIdUrl +
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
    let token = await utils.getUserToken(openId);

    resData = { code: 0, userId: openId, token };
  } catch (e) {
    console.log(e);
    res.json({ code: 900 });
    return;
  }

  res.json(resData);
});
export default router;
