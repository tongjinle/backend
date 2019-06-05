// 官方通知
import getMongoClient from "../getMongoClient";
import config from "../config";
import { isMainThread } from "worker_threads";
import md5 = require("md5");

let dbName: string = config.dbName;

type Notice = {
  id: string;
  token: string;
  text: string;
  // 奖励
  coin?: number;
};

export async function add(
  token: string,
  text: string,
  coin: number = 0
): Promise<void> {
  let mongo = await getMongoClient();
  await mongo
    .db(dbName)
    .collection("notice")
    .insertOne({
      id: md5(Math.random().toString()),
      token,
      text,
      coin,
      isRead: false
    });
}

export async function list(token: string): Promise<Notice[]> {
  let rst: Notice[];

  let mongo = await getMongoClient();
  let data = await mongo
    .db(dbName)
    .collection("notice")
    .find({ token, isRead: false })
    .toArray();

  rst = data.map(n => {
    return {
      id: n.id,
      token: n.token,
      text: n.text,
      coin: n.coin || 0
    };
  });

  return rst;
}

export async function read(id: string): Promise<void> {
  let mongo = await getMongoClient();
  await mongo
    .db(dbName)
    .collection("notice")
    .updateOne(
      { id, isRead: false },
      {
        $set: {
          isRead: true,
          readTimestamp: new Date()
        }
      }
    );
}
