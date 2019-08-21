import { getCollection } from "../getMongoClient";
import { func } from "@hapi/joi";
import { Collection } from "mongodb";
import { upvote } from "../service/race";

let collUser: Collection;
let collDiary: Collection;
let collRace: Collection;
let collRacePlayer: Collection;
let collRaceUpvoter: Collection;
let collRaceUpvoteLog: Collection;
let collNotice: Collection;
let collSign: Collection;

export default async function recover() {
  collUser = await getCollection("user");
  collDiary = await getCollection("diary");
  collRace = await getCollection("race");
  collRacePlayer = await getCollection("racePlayer");
  collRaceUpvoter = await getCollection("raceUpvoter");
  collRaceUpvoteLog = await getCollection("raceUpvoteLog");
  collNotice = await getCollection("notice");
  collSign = await getCollection("sign");

  await Promise.all(
    [
      collUser,
      collDiary,
      collRace,
      collRacePlayer,
      collRaceUpvoter,
      collRaceUpvoteLog,
      collNotice,
      collSign
    ].map(coll => coll.deleteMany({}))
  );

  await recoverUser();
  await recoverDiary();
  await recoverRace();
  await recoverNotice();
}

// 用户数据
async function recoverUser() {
  await collUser.insertMany([
    {
      userId: "tongyan",
      nickname: "童颜",
      gender: "female",
      bgUrl:
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E7%AB%A5%E9%A2%9C/080942a0fee28fa6bbc1be6790718757.jpg",
      logoUrl:
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E7%AB%A5%E9%A2%9C/080942a0fee28fa6bbc1be6790718757.jpg",
      city: "上海",
      birthYear: 2000,
      coin: 9000,
      upvoted: 1,
      upvotedCoin: 100,
      beUpvoted: 10,
      beUpvotedCoin: 13200
    },
    {
      userId: "wangyun",
      nickname: "王云",
      gender: "female",
      logoUrl:
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E6%B5%85%E6%B5%85/0bafca06466c9de2c366ed21f10d8b44.jpg",
      city: "北京",
      birthYear: 2001,
      coin: 10000,
      upvoted: 2,
      upvotedCoin: 80,
      beUpvoted: 5,
      beUpvotedCoin: 1200
    }
  ]);
}

// 日记数据
async function recoverDiary() {
  let coll = await getCollection("diary");
  coll.insertMany([
    {
      userId: "tongyan",
      text: "无聊的日子,在家撸猫......",
      url:
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/test/yanzhiyouli/medias/1.jpg",
      type: "image",
      time: new Date(2019, 7, 1),
      score: 98,
      upvote: 1000,
      coin: 3400
    },
    {
      userId: "tongyan",
      text: "我叫江户川柯南,我是个侦探",
      url:
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/test/yanzhiyouli/medias/1.mp4",
      type: "video",
      time: new Date(2018, 7, 2),
      score: -1,
      upvote: 3500,
      coin: 80
    },
    {
      userId: "wangyun",
      text: "四川人在太原",
      url:
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/test/yanzhiyouli/medias/2.jpg",
      type: "image",
      time: new Date(1546272000000),
      score: -1,
      upvote: 300,
      coin: 0
    },
    {
      userId: "wangyun",
      text: "云南人在吹牛",
      url:
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/test/yanzhiyouli/medias/3.jpg",
      type: "image",
      time: new Date(1546272000000),
      score: -1,
      upvote: 300,
      coin: 0
    },
    {
      userId: "wangyun",
      url:
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/test/yanzhiyouli/medias/music.mp3",
      type: "audio",
      time: new Date(1546272000000),
      score: -1,
      upvote: 300,
      coin: 0
    }
  ]);
}

// 比赛数据
async function recoverRace() {
  let startTime = new Date();
  await collRace.insertMany([
    {
      name: "颜值杯",
      days: 1,
      startTime,
      endTime: new Date(startTime.getTime() + 5 * 60 * 1000),
      postUrls: [
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/test/yanzhiyouli/post/1.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/test/yanzhiyouli/post/2.jpg"
      ],
      status: "race"
    }
  ]);

  await collRacePlayer.insertMany([
    {
      raceName: "颜值杯",
      userId: "wangyun",
      nickname: "王云",
      logoUrl:
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E6%B5%85%E6%B5%85/0bafca06466c9de2c366ed21f10d8b44.jpg",
      upvote: 888
    },
    {
      raceName: "颜值杯",
      userId: "tongyan",
      nickname: "童颜",
      logoUrl:
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E7%AB%A5%E9%A2%9C/080942a0fee28fa6bbc1be6790718757.jpg",
      upvote: 1200
    }
  ]);

  await collRaceUpvoter.insertMany([
    {
      raceName: "颜值杯",
      userId: "tongyan",
      nickname: "童颜",
      logoUrl:
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E7%AB%A5%E9%A2%9C/080942a0fee28fa6bbc1be6790718757.jpg",
      coin: 1000
    }
  ]);
}

// recover官方通知
async function recoverNotice() {
  // 家琪的openid
  let userId = "oT-BK5ILEuHHhzKa2vOrs4d1jR-4";
  collNotice.insertMany([
    {
      userId,
      text: "家琪,欢迎你",
      coin: undefined,
      type: "normal",
      timestamp: new Date(2019, 5, 1),
      readTimestamp: new Date(2019, 6, 1)
    },
    {
      userId,
      text: "很遗憾,小猪没有接受你的金币",
      coin: 10,
      type: "back",
      timestamp: new Date(2019, 6, 1)
    },
    {
      userId,
      text: "扑满为你投币了10金币",
      coin: undefined,
      type: "sendCoin",
      timestamp: new Date(2019, 7, 1)
    },
    {
      userId,
      text: "你成功邀请了新用户王云,奖励100金币",
      coin: 100,
      type: "shareReward",
      timestamp: new Date(2019, 7, 5)
    }
  ]);

  {
    let userId = "oT-BK5Mww0ZXNS3D-0J-jwVSDdLk";
    collNotice.insertMany([
      {
        userId,
        text: "扑满,欢迎你",
        coin: undefined,
        type: "normal",
        timestamp: new Date(2019, 5, 1),
        readTimestamp: new Date(2019, 6, 1)
      },
      {
        userId,
        text: "很遗憾,小猪没有接受你的金币",
        coin: 10,
        type: "back",
        timestamp: new Date(2019, 6, 1)
      },
      {
        userId,
        text: "王云为你投币了10金币",
        coin: undefined,
        type: "sendCoin",
        timestamp: new Date(2019, 7, 1)
      },
      {
        userId,
        text: "你成功邀请了新用户周淑婷,奖励200金币",
        coin: 200,
        type: "shareReward",
        timestamp: new Date(2019, 6, 6)
      }
    ]);
  }
}
