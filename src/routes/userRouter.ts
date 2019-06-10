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

  resData = { coin };
  res.json(resData);
});
