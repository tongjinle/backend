import * as joi from "@hapi/joi";
import * as express from "express";
import * as userService from "../service/userService";
import * as bottleService from "../service/bottleService";
import * as protocol from "../protocol";
import errs from "../errCode";
import tokenMw from "./tokenMw";

let router = express.Router();

router.post("/reg", async (req, res) => {
  let resData: protocol.IResReg;
  let token: string = await userService.reg();
  resData = { code: 0, token };
  res.json(resData);
});

export default router;
