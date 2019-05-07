import * as express from "express";
import * as protocol from "../protocol";
import {
  picList,
  picCount,
  picListForCheck,
  picListForChecked,
  setIsGirl,
  setIsPorn
} from "../service/picService";
import { url } from "inspector";

export default function handle(app: express.Express) {
  app.get("/picList", async (req, res) => {
    let resData: protocol.IResPicList;
    let name = req.query["name"];
    let pageIndex = req.query["pageIndex"] - 0;
    let pageSize = req.query["pageSize"] - 0;

    console.log({ name, pageIndex, pageSize });

    let list = await picList(name, pageIndex, pageSize);
    resData = {
      code: 0,
      list: list.map(n => ({
        id: n.id,
        name: n.name,
        url: n.url,
        timestamp: n.timestamp
      }))
    };
    res.json(list);
  });

  app.get("/picCount", async (req, res) => {
    let resData: protocol.IResPicCount;
    let list = await picCount();
    resData = {
      code: 0,
      list: list.map(n => ({
        name: n.name,
        logo: n.logo,
        count: n.count
      }))
    };
    res.json(resData);
  });

  // admin
  // 获取没有被人工确定过的列表
  app.get("/pic/admin/beforeCheck", async (req, res) => {
    let resData: protocol.IResPicInfoBeforeCheck;
    let pageIndex = req.query["pageIndex"] - 0;
    let pageSize = req.query["pageSize"] - 0;

    let list = await picListForCheck(pageIndex, pageSize);
    resData = {
      code: 0,
      list: list.map(n => ({
        id: n.id,
        url: n.url,
        isPorn: n.isPorn,
        isPorn2: n.isPorn2,
        isGirl: n.isGirl,
        isGirl2: n.isGirl2
      }))
    };
    res.json(resData);
  });

  // 获取被人工确定过的列表
  app.get("/pic/admin/afterCheck", async (req, res) => {
    let resData: protocol.IResPicInfoAfterCheck;
    let pageIndex = req.query["pageIndex"] - 0;
    let pageSize = req.query["pageSize"] - 0;

    let list = await picListForChecked(pageIndex, pageSize);
    resData = {
      code: 0,
      list: list.map(n => ({
        id: n.id,
        url: n.url,
        isPorn: n.isPorn,
        isPorn2: n.isPorn2,
        isGirl: n.isGirl,
        isGirl2: n.isGirl2
      }))
    };
    res.json(resData);
  });

  // 人工设置是否是女孩
  app.post("/pic/admin/setIsGirl", async (req, res) => {
    let resData: protocol.IResPicSetIsGirl;
    let data = req.body as protocol.IReqPicSetIsGirl;

    await setIsGirl(data.nameList, data.isGirl);
    resData = { code: 0 };
    res.json(resData);
  });
  // 人工设置是否是女孩
  app.post("/pic/admin/setIsPorn", async (req, res) => {
    let resData: protocol.IResPicSetIsPorn;
    let data = req.body as protocol.IReqPicSetIsPorn;

    await setIsPorn(data.nameList, data.isPorn);
    resData = { code: 0 };
    res.json(resData);
  });
}
