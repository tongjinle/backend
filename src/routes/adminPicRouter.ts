import * as express from "express";
import * as protocol from "../protocol";
import {
  picListWithStatus,
  picListWithStatusCount,
  setStatus
} from "../service/picService";

type Status = -1 | 0 | 1;
let router = express.Router();
router.get("/picList", async (req, res) => {
  let resData: protocol.IResPicProList;
  let query: protocol.IReqPicProList = req.query;

  let status: Status = (query.status - 0) as Status;
  let pageIndex = query.pageIndex - 0;
  let pageSize = query.pageSize - 0;

  let data = await picListWithStatus(status, pageIndex, pageSize);
  let total = await picListWithStatusCount(status);
  resData = {
    code: 0,
    list: data.map(n => {
      return {
        id: n.id,
        url: n.url,
        name: n.name,
        timestamp: n.timestamp,
        suggest: n.suggest
      };
    }),
    total
  };
  res.json(resData);
});

router.post("/status", async (req, res) => {
  let resData: protocol.IResPicSetStatus;
  let body: protocol.IReqPicSetStatus = req.body;

  let id = body.id;
  let status = body.status;

  await setStatus(id, status);

  resData = { code: 0 };
  res.json(resData);
});

export default router;
