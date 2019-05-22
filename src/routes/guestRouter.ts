import * as express from "express";
import * as protocol from "../protocol";
import * as photoService from "../service/photo";
import errs from "../errCode";
let router = express.Router();

// 排行榜
router.get("/sort/", async (req, res) => {
  let resData: protocol.IResSort;
  let list = await photoService.sort();
  resData = { code: 0, list };
  res.json(resData);
});

// 通过id查看某张照片
router.get("/search/", async (req, res) => {
  let resData: protocol.IResSearchPhoto;
  let id: string = req.query["id"];
  let photo = await photoService.search(id);
  if (!photo) {
    res.json(errs.photo.noExists);
    return;
  }
  resData = Object.assign({ code: 0 }, photo);
  res.json(resData);
});
export default router;
