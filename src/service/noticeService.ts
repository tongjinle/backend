// 官方通知
import getMongoClient from "../getMongoClient";
import config from "../config";

let dbName: string = config.dbName;

type Notice = {
  id: string;
  text: string;
  // 奖励
  coin?: number;
};

export async function list(token: string): Promise<Notice[]> {
  let rst: Notice[];

  let mongo = await getMongoClient();
  let data = await mongo
    .db(dbName)
    .collection("notice")
    .find({ token, isRead: false })
    .toArray();

  rst = data.map(n => {
    return {
      id: n.id,
      text: n.text,
      coin: n.coin || 0
    };
  });

  return rst;
}

export async function read(token: string, id: string): Promise<void> {
  let mongo = await getMongoClient();
  await mongo
    .db(dbName)
    .collection("notice")
    .updateOne(
      { token, id },
      {
        $set: {
          isRead: true,
          readTimestamp: new Date()
        }
      }
    );
}
