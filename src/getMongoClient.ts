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
  await client.connect();
  return client;
}

type GetCollection = (name: string) => Promise<mongodb.Collection>;
export async function getMongoEnv(
  fn: ({ getCollection: GetCollection }) => any
) {
  let client = await getMongoClient();
  let getCollection: GetCollection = async (name: string) =>
    client.db(config.dbName).collection(name);

  let rst = await fn({ getCollection });
  await client.close();
  console.log("release");
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
