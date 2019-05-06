import * as express from "express";
import * as protocol from "../protocol";
import { picList } from "../service/picService";

export default function handle(app: express.Express) {
  app.get("/picList", async (req, res) => {
    let resData: protocol.IResPicList;
    let name = req.query["name"];
    let pageIndex = req.query["pageIndex"] - 0;
    let pageSize = req.query["pageSize"] - 0;

    console.log({ name, pageIndex, pageSize });

    let list: any = await picList(name, pageIndex, pageSize);
    resData = {
      code: 0,
      list
    };
    res.json(list);
  });
}
