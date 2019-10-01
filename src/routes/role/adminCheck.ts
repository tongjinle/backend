import express = require("express");
import * as joi from "@hapi/joi";
import errs from "../../errCode";
import utils from "../../utils";

const TOKEN = utils.getUserToken("sanniantea");

export default function adminCheck(
  req: express.Request,
  res: express.Response,
  next: Function
) {
  let flag: boolean;
  flag = true;

  let token: string = req.header("token");
  // console.log({ token });
  let result = joi.validate(
    { token },
    {
      token: joi.string().required()
    }
  );

  if (result.error) {
    console.error(result.error);
    res.json(errs.common.invalidParams);
    return;
  }

  if (token !== TOKEN) {
    res.json(errs.common.wrongToken);
    return;
  }

  // console.log("check admin role:", flag);
  next();
}
