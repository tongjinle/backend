import * as mongodb from "mongodb";
import config from "./config/index";

let client: mongodb.MongoClient;
export async function getMongoClient(): Promise<mongodb.MongoClient> {
  let client = new mongodb.MongoClient(config.connectStr, {
    useNewUrlParser: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    autoReconnect: true,
    poolSize: 100
  });
  let d1 = Date.now();
  await client.connect();
  let d2 = Date.now();
  console.log("connect duration:", d2 - d1);
  return client;
}

type GetCollection = (name: string) => mongodb.Collection;
export async function usingMongoEnv(
  fn: ({ getCollection }: { getCollection: GetCollection }) => any
) {
  let client = await getMongoClient();
  let getCollection: GetCollection = (name: string) =>
    client.db(config.dbName).collection(name);

  let rst = await fn({ getCollection });
  let d1 = Date.now();
  // await client.close();
  let d2 = Date.now();
  console.log("close duration:", d2 - d1);
  return rst;
}

export async function closeMongoClient(): Promise<void> {
  if (client && client.isConnected()) {
    await client.close();
    client = undefined;
  }
}

export async function getCollection(name: string): Promise<mongodb.Collection> {
  let client = await getMongoClient();
  return client.db(config.dbName).collection(name);
}

export function getObjectId(id: string) {
  return new mongodb.ObjectId(id);
}
