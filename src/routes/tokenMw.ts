import * as joi from "@hapi/joi";
import * as express from "express";
import * as userService from "../service/userService";
import errs from "../errCode";

async function tokenMw(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  let token: string = req.header("token");
  if (!token || (await userService.isReged(token))) {
    res.json(errs.common.invalidToken);
    return;
  }
  next();
}

export default tokenMw;
