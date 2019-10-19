import * as express from "express";
import * as protocol from "../protocol";
import * as userService from "../service/user";
import * as raceService from "../service/race";
import * as diaryService from "../service/diary";
import * as noticeService from "../service/notice";
import userCheck from "./role/userCheck";
import * as joi from "@hapi/joi";
import { getRedisClient } from "../redis";
import * as redisKey from "../redisKey";
import { MIN, SEC } from "../constant";

let router = express.Router();

// check user role
router.use(userCheck);

// 新增日记
router.post("/add", async (req, res) => {
  let resData: {} & protocol.IResBase;
  let reqData: {
    // 简单文本
    text: string;
    // 日记地址
    url: string;
    // 类型
    type: diaryService.MediaType;
    // 得分(仅为image的时候存在)
    score?: number;
  } = req.body;

  let userId: string = req.header("userId");

  {
    let result = joi.validate(reqData, {
      text: joi
        .string()
        .required()
        .allow(""),
      url: joi.string().required(),
      type: joi
        .string()
        .required()
        .allow("image", "video", "audio"),
      score: joi.number()
    });
    if (result.error) {
      res.json({ code: -1, message: "参数格式不正确" });
      console.error(result.error);
      return;
    }
  }

  let text = reqData.text || "";
  let url = reqData.url;
  let type: diaryService.MediaType = reqData.type as diaryService.MediaType;

  let score = -1;
  if (type === "image") {
    score = 80;
    // todo
  }

  await diaryService.add(userId, text, url, type, score);

  // redis
  {
    let client = await getRedisClient();
    let key = redisKey.userDiaryList(userId);
    await client.del(key);
  }

  resData = { code: 0 };
  res.json(resData);
});

// 查询日记
router.get("/query", async (req, res) => {
  let resData: { nickname: string; logoUrl: string } & diaryService.Diary &
    protocol.IResBase;
  let reqData: {
    id: string;
  } = req.query;

  {
    let result = joi.validate(reqData, {
      id: joi.string().required()
    });
    if (result.error) {
      res.json({ code: -1, message: "参数格式不正确" });
      console.error(result.error);
      return;
    }
  }

  let data = await diaryService.find(reqData.id);
  if (!data) {
    res.json({ code: -1, message: "没有该id的日记" });
    return;
  }

  let user = await userService.find(data.userId);

  resData = {
    code: 0,
    ...data,
    nickname: user.nickname,
    logoUrl: user.logoUrl
  };
  res.json(resData);
});

// 删除日记
router.post("/remove", async (req, res) => {
  let resData: {} & protocol.IResBase;
  let reqData: { id: string } = req.body;

  let id = reqData.id;
  let userId: string = req.header("userId");
  if (!(await diaryService.canRemove(id, userId))) {
    res.json({ code: -1, message: "删除日记失败" });
    return;
  }

  await diaryService.remove(id);

  // redis
  {
    let client = await getRedisClient();
    await client.del(redisKey.freshDiaryList(id));
    await client.del(redisKey.topDiaryList(id));

    await client.del(redisKey.userDiaryList(userId));
  }

  resData = { code: 0 };
  res.json(resData);
});

// 打榜日记
router.post("/upvote", async (req, res) => {
  let resData: {} & protocol.IResBase;
  let reqData: { id: string; coin: number } = req.body;

  let userId: string = req.header("userId");

  {
    let result = joi.validate(reqData, {
      id: joi.string().required(),
      coin: joi
        .number()
        .positive()
        .required()
    });

    if (result.error) {
      res.json({ code: -1, message: "参数不符合规则" });
      return;
    }
  }
  let id = reqData.id;
  let coin = reqData.coin;

  // 暂时允许重复打榜
  // if (!(await diaryService.canUpvote(id, userId))) {
  //   res.json({ code: -1, message: "重复打榜" });
  //   return;
  // }

  // coin检测
  let user = await userService.find(userId);
  // console.log({ usercoin: user.coin, coin });
  if (!(user && user.coin >= coin)) {
    res.json({ code: -2, message: "代币不足" });
    return;
  }

  let diary = await diaryService.find(id);
  if (!diary) {
    console.log({ id });
    res.json({ code: -3, message: "不存在日记" });
    return;
  }

  // 日记打榜
  await diaryService.upvote(id, userId, coin);
  // 被打榜者的打榜次数和打榜金币的处理
  await userService.updateUpvote(diary.userId, userId, coin);
  // 官方消息
  noticeService.add(
    diary.userId,
    `${user.nickname}为你投币了${coin}个金币`,
    0,
    "sendCoin"
  );
  // 打榜者扣除相应金币
  await userService.updateCoin(userId, -coin);

  // race
  // 如果有比赛开启,则会把upvote也记录到race中去
  let race = await raceService.findInRace();
  if (race) {
    await raceService.upvote(userId, diary.userId, race.name, coin);
  }

  // redis
  {
    let client = await getRedisClient();
    let update = async (key: string, diaryId: string) => {
      if (await client.exists(key)) {
        // let diary: diaryService.Diary = JSON.parse(await client.get(key));
        let diary: diaryService.Diary = await diaryService.find(diaryId);
        if (diary) {
          let user = await userService.find(diary.userId);
          if (user) {
            let fullDiary = {
              ...diary,
              nickname: user.nickname,
              logoUrl: user.logoUrl
            };
            console.log({ fullDiary });
            await client.set(key, JSON.stringify(fullDiary));
          }
        } else {
          await client.del(key);
        }
      }
    };
    await update(redisKey.freshDiaryList(id), id);
    await update(redisKey.topDiaryList(id), id);
  }
  // userDiaryList
  {
    let client = await getRedisClient();
    let key = redisKey.userDiaryList(diary.userId);
    await client.del(key);
  }
  // player hot
  {
    let client = await getRedisClient();
    let key = redisKey.hot(diary.userId);
    await client.del(key);
  }

  resData = { code: 0 };
  res.json(resData);
});

// 获取用户的日记列表
router.get("/list", async (req, res) => {
  let reqData: { userId: string } = req.query;
  let resData: { list: diaryService.Diary[] } & protocol.IResBase;

  {
    let result = joi.validate(reqData, { userId: joi.string().required() });
    if (result.error) {
      res.json({ code: -1, message: "缺少userId参数" });
      return;
    }
  }
  let diaryUserId: string = reqData.userId;
  console.log({ diaryUserId });

  let list: diaryService.Diary[] = [];
  // redis
  {
    let client = await getRedisClient();
    let key = redisKey.userDiaryList(diaryUserId);
    let expire = 5 * MIN;
    if (!(await client.exists(key))) {
      let list = await diaryService.list(diaryUserId);
      await client.set(key, JSON.stringify(list));
      await client.pexpire(key, expire);
    }
    list = JSON.parse(await client.get(key));
  }

  resData = { code: 0, list };
  res.json(resData);
});

// 获取推荐日记列表
router.get("/recommend", async (req, res) => {
  let resData: { list: diaryService.Diary[] } & protocol.IResBase;
  let reqData: {};

  const topLimit = 100;
  const topCount = 3;
  const topExpire = 5 * MIN;
  const freshLimit = 100;
  const freshCount = 8;
  const freshExpire = 5 * MIN;
  let freshes: diaryService.Diary[];
  let tops: diaryService.Diary[];

  let client = await getRedisClient();
  let writeToCache = async (key: "fresh" | "top") => {
    let flagKey = redisKey.flag(key);
    let isFlag = await client.exists(flagKey);
    if (isFlag) {
      return;
    }

    await clearCache(key);

    let getLimit: () => Promise<diaryService.Diary[]>;
    let getKey: (id: string) => string;
    let expire: number;
    if (key === "fresh") {
      getLimit = () => diaryService.freshList(freshLimit);
      expire = freshExpire;
      getKey = id => redisKey.freshDiaryList(id);
    } else {
      getLimit = () => diaryService.topList(topLimit);
      expire = topExpire;
      getKey = id => redisKey.topDiaryList(id);
    }

    let list = await getLimit();
    await Promise.all(
      list.map(async diary => {
        let user = await userService.find(diary.userId);
        if (user) {
          let key = getKey(diary.id);
          let value = JSON.stringify({
            ...diary,
            nickname: user.nickname,
            logoUrl: user.logoUrl
          });
          await client.set(key, value);
        }
      })
    );

    await client.set(flagKey, "1");
    await client.pexpire(flagKey, expire);
  };

  let readFromCache = async (name: "fresh" | "top") => {
    let pattern: string;
    if (name === "fresh") {
      pattern = redisKey.freshDiaryList("*");
    } else {
      pattern = redisKey.topDiaryList("*");
    }
    let keys = await client.keys(pattern);
    let list = [];
    await Promise.all(
      keys.map(async key => {
        let value = await client.get(key);
        if (value) {
          list.push(JSON.parse(value));
        }
      })
    );
    return list;
  };

  let clearCache = async (name: "fresh" | "top") => {
    let pattern: string;
    if (name === "fresh") {
      pattern = redisKey.freshDiaryList("*");
    } else {
      pattern = redisKey.topDiaryList("*");
    }
    let keys = await client.keys(pattern);
    await client.del(...keys);
  };

  await writeToCache("fresh");
  await writeToCache("top");

  freshes = await readFromCache("fresh");
  tops = await readFromCache("top");

  let fetch = (arr, count) => {
    return arr
      .sort(() => 0.5 - Math.random())
      .filter((n, i) => i < count)
      .map(n => ({ ...n }));
  };

  let list = [...fetch(tops, topCount), ...fetch(freshes, freshCount)];

  resData = { code: 0, list };
  res.json(resData);
});

export default router;
