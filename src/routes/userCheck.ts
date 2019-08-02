import express = require("express");
import * as joi from "@hapi/joi";
import errs from "../errCode";
import utils from "../utils";

export default function userCheck(
  req: express.Request,
  res: express.Response,
  next: Function
) {
  let flag: boolean;
  flag = true;

  let userId: string = req.header("userId");
  let token: string = req.header("token");
  console.log({ userId, token });
  let result = joi.validate(
    { userId, token },
    {
      userId: joi.string().required(),
      token: joi.string().required()
    }
  );

  if (result.error) {
    res.json(errs.common.invalidParams);
    return;
  }

  if (token !== utils.getUserToken(userId)) {
    res.json(errs.common.wrongToken);
    return;
  }

  console.log("check user role:", flag);
  next();
}
