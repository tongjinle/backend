import axios from "axios";
import config from "../config";
import utils from "../utils";
import * as redisKey from "../redisKey";
import { getRedisClient } from "../redis";
import { HOUR } from "../constant";
import * as request from "request";
import * as FormData from "form-data";

export type PlatformName = "qq" | "wx";
type Setting = {
  appId: string;
  appSecret: string;
  openIdUrl: string;
  accessTokenUrl: string;
  imgSecCheckUrl: (accessToken: string) => string;
  msgSecCheckUrl: (accessToken: string) => string;
};

function getSetting(platformName: PlatformName): Setting {
  let rst: Setting;

  let appId: string;
  let appSecret: string;
  let openIdUrl: string;
  let accessTokenUrl: string;
  let imgSecCheckUrl;
  let msgSecCheckUrl;
  if (platformName === "qq") {
    appId = config.qq.appId;
    appSecret = config.qq.appSecret;
    openIdUrl = config.qqOpenIdUrl;
    accessTokenUrl = config.qqAccessTokenUrl;
    imgSecCheckUrl = accessToken =>
      `https://api.q.qq.com/api/json/security/ImgSecCheck?access_token=${accessToken}`;
    msgSecCheckUrl = accessToken =>
      `https://api.q.qq.com/api/json/security/MsgSecCheck?access_token=${accessToken}`;
  } else {
    appId = config.wx.appId;
    appSecret = config.wx.appSecret;
    openIdUrl = config.wxOpenIdUrl;
    accessTokenUrl = config.wxAccessTokenUrl;
  }
  rst = {
    appId,
    appSecret,
    openIdUrl,
    accessTokenUrl,
    imgSecCheckUrl,
    msgSecCheckUrl
  };
  return rst;
}

export async function getOpenId(
  platformName: PlatformName,
  code: string
): Promise<{ openId: string; token: string }> {
  let { appId, appSecret, openIdUrl } = getSetting(platformName);
  let { data } = await axios.get(openIdUrl, {
    params: { appId, appSecret, code }
  });
  let openId = data.openId;
  let token = await utils.getUserToken(openId);
  return { openId, token };
}

export async function getAccessToken(
  platformName: PlatformName
): Promise<string> {
  let rst = "";
  let { appId, appSecret, accessTokenUrl } = getSetting(platformName);

  let res = await axios.get(accessTokenUrl, {
    params: {
      appId,
      appSecret
    }
  });

  rst = res.data.accessToken;
  return rst;
}

// 获取本地的accessToken
// 将其保存在redis中
export async function getCacheAccessToken(
  platformName: PlatformName
): Promise<string> {
  let rst: string;
  let key = redisKey.accessToken(platformName);

  let client = await getRedisClient();
  if (await client.exists(key)) {
    rst = await client.get(key);
  } else {
    rst = await getAccessToken(platformName);
    await client.set(key, rst);
    await client.pexpire(key, 1.5 * HOUR);
  }
  return rst;
}

/**
 * 对图片进行内容安全检测
 * @param appId appId
 * @param url 等待检测的image在线地址
 * @returns false表示不能通过检测
 */
export async function imgSecCheck(
  platformName: PlatformName,
  imageUrl: string
): Promise<boolean> {
  let rst: boolean = false;
  let { appId, imgSecCheckUrl } = getSetting(platformName);
  let accessToken: string = await getCacheAccessToken(platformName);
  let url = imgSecCheckUrl(accessToken);

  let formData = new FormData();
  // appid虽然在qq小程序的文档中说要写,但是实际上可以没有
  formData.append("appid", appId);
  formData.append("media", request(imageUrl));
  let res = await axios({
    method: "post",
    url,
    data: formData,
    headers: formData.getHeaders()
  });

  rst = res.data.errCode === 0;

  return rst;
}

/**
 * 检测文本的内容是不是符合规范
 * true表示通过
 * @param content 等待检测的文本
 * @param appId appId
 * @param accessToken
 */
export async function msgSecCheck(
  platformName: PlatformName,

  content: string
): Promise<boolean> {
  let rst: boolean = false;

  let { appId, msgSecCheckUrl } = getSetting(platformName);
  let accessToken: string = await getCacheAccessToken(platformName);
  let url = msgSecCheckUrl(accessToken);

  let res = await axios.post(url, {
    appId,
    content
  });
  rst = res.data.errCode === 0;

  return rst;
}
