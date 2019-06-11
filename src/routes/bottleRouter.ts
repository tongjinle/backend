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

  // 需要给用户增加coin
  if (bottle === undefined) {
    res.json(errs.bottle.noBottle);
    return;
  } else if (bottle.type === "coin") {
    await userService.addCoin(token, bottle.coin);
    resData = {
      code: 0,
      type: "coin",
      coin: bottle.coin
    };
  } else {
    resData = {
      code: 0,
      id: bottle.id,
      type: "resource",
      preview: bottle.preview,
      url: bottle.url,
      price: bottle.price
    };
  }

  res.json(resData);
});

router.post("/password", async (req, res) => {
  let resData: protocol.IResPassword;
  let id: string = req.body.id;
  let token = req.header("token");
  let { error } = joi.validate({ id }, { id: joi.string().required() });
  if (error) {
    res.json(errs.common.invalidParams);
    return;
  }

  let bottle = await bottleService.getResourceBottle(id);
  console.log(bottle);
  let coin = await userService.coin(token);
  if (coin < bottle.price) {
    res.json(errs.user.notEnoughCoin);
    return;
  }

  await userService.addCoin(token, -bottle.price);

  let password: string = bottle.password;
  resData = { code: 0, password };
  res.json(resData);
});

export default router;
