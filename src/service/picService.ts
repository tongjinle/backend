import getMongoClient from "../getMongoClient";
import config from "../config";

let dbName = config.dbName;
// let collectionName = "girlday";
let collectionName = "girldayMock";

// 此处的id是数据库中的name,name为ext
type PicInfo = { id: string; url: string; name: string; timestamp: number };

type CountInfo = { name: string; logo: string; count: number };

export async function picList(
  name: string,
  pageIndex: number,
  pageSize: number
): Promise<PicInfo[]> {
  let rst: PicInfo[];
  let client = await getMongoClient();
  await client.connect();
  let data = await client
    .db(dbName)
    .collection(collectionName)
    .find({ name, status: 1 })
    .sort({ timestamp: -1 })
    .skip(pageIndex * pageSize)
    .limit(pageSize)
    .toArray();
  rst = data.map(n => {
    return {
      id: n.name,
      name,
      timestamp: n.timestamp,
      url: n.url
    };
  });
  await client.close();
  return rst;
}

// 统计图片信息
export async function picCount(): Promise<CountInfo[]> {
  let rst: CountInfo[] = [];

  let client = await getMongoClient();
  await client.connect();
  let data = await client
    .db(dbName)
    .collection(collectionName)
    .aggregate([
      // { $match: { name: { $in: girlNames } } },
      { $match: { status: 1 } },
      {
        $group: {
          _id: "$name",
          count: { $sum: 1 },
          logo: { $first: "$url" }
        }
      }
    ])
    .toArray();

  rst = data.map(n => {
    return {
      name: n._id,
      logo: n.logo,
      count: n.count
    };
  });
  await client.close();
  return rst;
}

// -1 不确定;0表示冻结;1表示使用
type PicStatus = -1 | 0 | 1;
// 设置图片状态
export async function setStatus(id: string, status: PicStatus): Promise<void> {
  let client = await getMongoClient();
  await client.connect();
  await client
    .db(dbName)
    .collection(collectionName)
    .updateOne({ id }, { $set: { status } });
  await client.close();
}

// 0表示不建议,1表示建议
type Suggest = 0 | 1;
type PicInfoPro = {
  id: string;
  url: string;
  name: string;
  timestamp: number;
  suggest: Suggest;
};

// 根据状态获取图片总量
export async function picListWithStatusCount(
  status: PicStatus
): Promise<number> {
  let rst: number = 0;
  let client = await getMongoClient();
  await client.connect();

  let query = {};
  if (status === -1) {
    query = {
      status: { $exists: false }
    };
  } else {
    query = { status };
  }

  let data: number = await client
    .db(dbName)
    .collection(collectionName)
    .countDocuments(query);

  await client.close();
  rst = data;
  return rst;
}

// 根据状态获取图片
export async function picListWithStatus(
  status: PicStatus,
  pageIndex: number,
  pageSize: number
): Promise<PicInfoPro[]> {
  let rst: PicInfoPro[] = [];
  let client = await getMongoClient();
  await client.connect();

  let query = {};
  if (status === -1) {
    query = {
      status: { $exists: false }
    };
  } else {
    query = { status };
  }

  let data: any[] = await client
    .db(dbName)
    .collection(collectionName)
    .find(query)
    .skip(pageIndex * pageSize)
    .limit(pageSize)
    .toArray();
  // 处理suggest
  rst = data.map(n => {
    // let suggest: Suggest = n.isGirl && !n.isPorn ? 1 : 0;
    let suggest: Suggest = 1;
    return {
      id: n.id,
      url: n.url,
      name: n.name,
      timestamp: n.timestamp,
      suggest
    };
  });

  await client.close();
  return rst;
}
