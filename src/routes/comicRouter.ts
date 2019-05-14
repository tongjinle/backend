import * as express from "express";
import * as protocol from "../protocol";
import { getComicList, getContent } from "../service/comicService";
import joi from "@hapi/joi";

let router = express.Router();
router.get("/comicList", async (req, res) => {
  let resData: protocol.IResComicList;
  let data = await getComicList();
  resData = {
    code: 0,
    list: data.map(n => ({
      title: n.title,
      count: n.count,
      logo: n.logo
    }))
  };
  res.json(resData);
});

router.get("/content", async (req, res) => {
  let resData: protocol.IResContent;

  const result = joi.validate(req.query, { title: joi.string().required() });
  if (result.error) {
    res.json({ code: 1 });
    return;
  }

  let { title } = req.query;
  let data = await getContent(title);
  resData = {
    code: 0,
    list: data.map(n => {
      return {
        index: n.index,
        url: n.url
      };
    })
  };

  res.json(resData);
});

export default router;
