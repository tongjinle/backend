import * as joi from "@hapi/joi";
import * as express from "express";
import * as userService from "../service/userService";
import * as bottleService from "../service/bottleService";
import * as protocol from "../protocol";
import errs from "../errCode";
import tokenMw from "./tokenMw";

let router = express.Router();

router.use(tokenMw);

router.get("/coin", async (req, res) => {
  let resData: protocol.IResCoin;
  let token: string = req.header("token");
  let coin: number = await userService.coin(token);

  resData = { code: 0, coin };
  res.json(resData);
});

router.post("/contribute", async (req, res) => {
  let resData: protocol.IResContribute;

  let token = req.header("token");

  let { error } = joi.validate(req.body, { url: joi.string().required() });
  console.log(error, req.body);
  if (error) {
    res.json(errs.common.invalidParams);
    return;
  }
  await userService.contribute(token, req.body.url);
  resData = { code: 0 };
  res.json(resData);
});

export default router;
