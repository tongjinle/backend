import * as md5 from "md5";
import { getMongoClient } from "../getMongoClient";
import config from "../config";

let dbName = config.dbName;
// 新注册用户的coin
let defaultCoin = config.defaultCoin;

type ShareInfo = {
  url: string;
  imageUrl: string;
};

export async function reg(): Promise<string> {
  let rst: string;
  let token: string = md5(Math.random().toString());
  let mongo = await getMongoClient();
  await mongo
    .db(dbName)
    .collection("user")
    .insertOne({ token, coin: defaultCoin });
  rst = token;
  return rst;
}

export async function isReged(token: string): Promise<boolean> {
  let rst: boolean;
  let mongo = await getMongoClient();
  rst = !!(await mongo
    .db(dbName)
    .collection("user")
    .findOne({ token }));
  return rst;
}

export async function coin(token: string): Promise<number> {
  let rst: number = 0;
  let mongo = await getMongoClient();
  let data = await mongo
    .db(dbName)
    .collection("user")
    .findOne({ token });

  rst = data ? data.coin : 0;
  return rst;
}

export async function addCoin(token: string, coin: number): Promise<void> {
  let mongo = await getMongoClient();
  await mongo
    .db(dbName)
    .collection("user")
    .updateOne({ token }, { $inc: { coin } });
}

// 贡献(上传)
export async function contribute(token: string, url: string): Promise<void> {
  let mongo = await getMongoClient();
  await mongo
    .db(dbName)
    .collection("contribute")
    .insertOne({ token, url, isCheck: false });
}

// 转发
export async function share(token: string): Promise<ShareInfo> {
  let rst: ShareInfo;
  return rst;
}
