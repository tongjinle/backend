import { getCollection } from "../mongo";

export type PostStatus = "prepare" | "using";
export interface IPOST {
  name: string;
  postUrlList: string[];
  status: PostStatus;
  /**
   * 海报创建时间戳
   */
  timestamp: number;
}

/**
 * 能否新增海报套餐
 * @param name 套餐名字
 */
export async function canAdd(name: string): Promise<boolean> {
  let coll = await getCollection("post");
  return !(await coll.findOne({ name }));
}

/**
 * 新增海报套餐
 * @param name 套餐名字
 * @param postUrlList 海报url列表
 */
export async function add(name: string, postUrlList: string[]): Promise<void> {
  let coll = await getCollection("post");
  let post: IPOST = {
    name,
    postUrlList,
    status: "prepare",
    timestamp: Date.now()
  };
  await coll.insertOne(post);
}

/**
 * 删除海报套餐
 * @param name 套餐名字
 */
export async function remove(name: string): Promise<void> {
  let coll = await getCollection("post");
  await coll.deleteOne({ name });
}

/**
 * 套餐列表
 * @param status 套餐状态,留空表示搜索所有状态
 */
export async function list(status?: PostStatus): Promise<IPOST[]> {
  let rst: IPOST[];
  let coll = await getCollection("post");
  let data = await coll.find(status ? {} : { status }).toArray();
  rst = data.map(n => ({
    name: n.name,
    postUrlList: n.postUrlList,
    status: n.status,
    timestamp: n.timestamp
  }));
  return rst;
}

/**
 * 修改套餐状态
 * @param name 套餐名字
 * @param status 要修改的套餐的状态
 */
export async function changeStatus(
  name: string,
  status: PostStatus
): Promise<void> {
  let coll = await getCollection("post");
  await coll.updateOne({ name }, { $set: { status } });
}

/**
 * 使用套餐
 * @param name 套餐名字
 */
export async function using(name: string) {
  let coll = await getCollection("post");
  // 其他的改成
  {
    let status: PostStatus = "prepare";
    await coll.updateMany({ name: { $not: name } }, { $set: { status } });
  }
  {
    let status: PostStatus = "using";
    await coll.updateOne({ name }, { $set: { status } });
  }
}
