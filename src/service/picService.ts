import db from "../db";

type picInfo = { id: string; url: string; name: string; timestamp: number };

type countInfo = { name: string; logo: string; count: number };

export async function picList(
  name: string,
  pageIndex: number,
  pageSize: number
): Promise<picInfo[]> {
  let rst: picInfo[];
  let client = await db.getIns();
  let data = await client
    .getCollection("twitter")
    // .find({})
    .find({ ext: name })
    .sort({ timestamp: -1 })
    .skip(pageIndex * pageSize)
    .limit(pageSize)
    .toArray();
  rst = data.map(n => {
    return {
      id: n.name,
      name,
      timestamp: n.timestamp,
      url: n.remoteUrl
    };
  });
  return rst;
}

// 统计图片信息
const validGirls: { name: string; logo: string }[] = [
  {
    name: "小鹿豬比",
    logo:
      "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E5%B0%8F%E9%B9%BF%E8%B1%AC%E6%AF%94/034b8d45c2140f1a4697cf1d9c4b4a34.jpg"
  },
  {
    name: "二佐Nisa",
    logo:
      "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E4%BA%8C%E4%BD%90Nisa/3e81b6cea41f8b2319d19a02f90875eb.jpg"
  },
  {
    name: "雪琪SAMA",
    logo:
      "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E9%9B%AA%E7%90%AASAMA/06934292f9e7c40a8494be9453e1b4e3.jpg"
  },
  {
    name: "yami",
    logo:
      "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/yami/084ac6c05e89d50c75e7b76034bce16f.jpg"
  },
  {
    name: "Liyuu",
    logo:
      "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/Liyuu/07e6c2ed02b5eb2decafcf142a658c3a.jpg"
  },
  {
    name: "千葉",
    logo:
      "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E5%8D%83%E8%91%89/47fb923a547879a136b3b87e6af459c1.jpg"
  },
  {
    name: "娇娇萝莉要努力！",
    logo:
      "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E5%A8%87%E5%A8%87%E8%90%9D%E8%8E%89%E8%A6%81%E5%8A%AA%E5%8A%9B%EF%BC%81/ab9ccf87ed944d1fb5d31b6b7d86d945.jpg"
  },
  // { name: "肉肉_niku", logo: "" },
  {
    name: "童颜",
    logo:
      "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/pacong/twitter/%E7%AB%A5%E9%A2%9C/b28bd8774ab88ad907070772e2d013b3.jpg"
  }
  // { name: "小姐姐", logo: "" },
  // { name: "小鸡腿", logo: "" }
];
export async function picCount(): Promise<countInfo[]> {
  let rst: countInfo[] = [];
  let client = await db.getIns();
  let data = await client
    .getCollection("twitter")
    .aggregate([
      { $match: { ext: { $in: validGirls } } },
      { $group: { _id: "$ext", count: { $sum: 1 } } }
    ])
    .toArray();

  rst = data.map(n => ({
    name: n._id,
    logo: n.logo,
    count: n.count
  }));

  return rst;
}
