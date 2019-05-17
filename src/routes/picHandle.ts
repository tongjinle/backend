import * as express from "express";
import * as protocol from "../protocol";
import { picList, picCount } from "../service/picService";
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
    res.json(resData);
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
}
