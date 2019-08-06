import { getCollection } from "../getMongoClient";
import { func } from "@hapi/joi";
import { Collection } from "mongodb";

let collUser: Collection;
let collDiary: Collection;

export default async function recover() {
  collUser = await getCollection("user");
  collDiary = await getCollection("diary");

  await Promise.all([collUser, collDiary].map(coll => coll.deleteMany({})));

  await recoverUser();
  await recoverDiary();
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
      coin: 90
    },
    {
      userId: "wangyun",
      nickname: "王云",
      gender: "female",
      logoUrl:
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E6%B5%85%E6%B5%85/0bafca06466c9de2c366ed21f10d8b44.jpg",
      city: "北京",
      birthYear: 2001,
      coin: 100
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
      timeStamp: new Date(2018, 7, 2),
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
      timeStamp: new Date(1546272000000),
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
      timeStamp: new Date(1546272000000),
      score: -1,
      upvote: 300,
      coin: 0
    },
    {
      userId: "wangyun",
      url:
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/test/yanzhiyouli/medias/music.mp3",
      type: "audio",
      timeStamp: new Date(1546272000000),
      score: -1,
      upvote: 300,
      coin: 0
    }
  ]);
}
