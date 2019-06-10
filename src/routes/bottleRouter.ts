import * as joi from "@hapi/joi";
import * as express from "express";
import * as userService from "../service/userService";
import * as bottleService from "../service/bottleService";
import * as protocol from "../protocol";
import errs from "../errCode";
import tokenMw from "./tokenMw";

let router = express.Router();

router.use(tokenMw);

router.post("/fetch", async (req, res) => {
  let resData: protocol.IResFetch;
  let token = req.header("token");
  let bottle = await bottleService.fetch(token, new Date());
  resData = {
    id: bottle.id,
    type: bottle.type,
    preview: bottle.preview,
    url: bottle.url,
    coin: bottle.coin
  };
  res.json(resData);
});

router.post("/password", async (req, res) => {
  let resData: protocol.IResPassword;
  let id: string = req.body.id;

  let { error } = joi.validate({ id }, { id: joi.string().required });
  if (error) {
    res.json(errs.common.invalidParams);
    return;
  }

  let password: string = await bottleService.password(id);
  resData = { password };
  res.json(resData);
});

export default router;
