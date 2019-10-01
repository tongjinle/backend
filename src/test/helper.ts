import * as path from "path";
import { fork, ChildProcess } from "child_process";
import axios, { AxiosInstance } from "axios";
import utils from "../utils";
import config from "../config";
import { getCollection } from "../mongo";
import * as userService from "../service/user";

/**
 * 延迟函数
 * @param ms 延迟时间,单位为毫秒
 */
export async function delay(ms: number): Promise<void> {
  await new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

/**
 * 开启app服务端
 */
export async function startApp(): Promise<ChildProcess> {
  let file = path.resolve(__dirname, "../app.js");
  // console.log(file);
  let worker = fork(file);
  await delay(5000);

  return worker;
}

/**
 * 关闭app服务端
 */
export async function closeApp(worker: ChildProcess): Promise<void> {
  worker.kill();
}

/**
 * 生成一个带token的axios实例
 * @param userId 用户id
 */
export async function createRequest(userId: string): Promise<AxiosInstance> {
  let token = await utils.getUserToken(userId);

  let info: userService.BasicInfo = {
    userId,
    nickname: userId
  } as userService.BasicInfo;
  await userService.add(info);

  return axios.create({
    baseURL: `${config.protocol}://${config.host}:${config.port}`,
    headers: { userId, token }
  });
}

/**
 * 生成一个admin的axios实例
 * @param userId 用户id
 */
export async function createAdminRequest(): Promise<AxiosInstance> {
  return createRequest("sanniantea");
}

/**
 * 生成一个axios实例
 */
export async function createBareRequest(): Promise<AxiosInstance> {
  return axios.create({
    baseURL: `${config.protocol}://${config.host}:${config.port}`
  });
}
