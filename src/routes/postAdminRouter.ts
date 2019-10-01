import * as express from "express";
import * as protocol from "../protocol";
import * as postService from "../service/post";

import * as joi from "@hapi/joi";

let router = express.Router();

// 新增海报
router.post("/add", async (req, res) => {
  let data = req.body;

  {
    let result = joi.validate(data, {
      name: joi.string().required(),
      postUrlList: joi.array().required()
    });

    if (result.error) {
      res.json({ code: -1, message: "参数不符合规则" });
      return;
    }
  }
  let { name, postUrlList } = data;

  if (!(await postService.canAdd(name))) {
    res.json({ code: -2, message: "不能增加同名套餐海报" });
    return;
  }

  await postService.add(name, postUrlList);
  res.json({ code: 0 });
});

// 海报列表
router.get("/list", async (req, res) => {
  let data = req.query;
  let status = data.status;
  let list = await postService.list(status);
  res.json({ code: 0, list });
});

// 删除海报
router.post("/remove", async (req, res) => {
  let name: string = req.body.name;

  await postService.remove(name);
  res.json({ code: 0 });
});

// 使用海报
router.post("/using", async (req, res) => {
  let name: string = req.body.name;
  await postService.using(name);
  res.json({ code: 0 });
});

export default router;
