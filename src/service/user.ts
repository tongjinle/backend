import config from "../config";
import { getMongoClient } from "../getMongoClient";
import md5 = require("md5");

type User = {
  userId: string;
  nickname: string;
};

// 新增一个用户
export async function addUser(userId: string): Promise<boolean> {
  let rst: boolean;

  let client = await getMongoClient();

  let collection = client.db(config.dbName).collection("user");
  if (!!(await collection.findOne({ userId }))) {
    rst = false;
  } else {
    await collection.insertOne({ userId });
    rst = true;
  }

  return rst;
}

// 更新用户信息
export async function updateUser(userId: string, info: {}): Promise<boolean> {
  let rst: boolean;

  let client = await getMongoClient();

  let collection = client.db(config.dbName).collection("user");

  let result = await collection.updateOne({ userId }, { $set: info });

  rst = result.modifiedCount === 1;
  return rst;
}

// 获取用户的信息
export async function getUser(userId: string): Promise<User> {
  let rst: User = undefined;

  let client = await getMongoClient();

  let collection = client.db(config.dbName).collection("user");
  let data = await collection.findOne({ userId });

  if (data) {
    rst = {
      userId: data.userId,
      nickname: data.nickname
    };
  }

  return rst;
}

// 检验用户token合法
export async function getToken(userId: string): Promise<string> {
  let rst: string;
  let code = "*UHB7ygv6tfc";
  let token: string = md5(userId + code);
  rst = token;
  return rst;
}

// 签到
export async function sign(
  userId: string,
  year: number,
  month: number,
  date: number
): Promise<number> {
  let rst: number = 0;

  let mongo = await getMongoClient();
  return rst;
}
