import * as mongodb from "mongodb";
import config from "./config/index";

let client: mongodb.MongoClient;
let { connectStr, dbName } = config.mongo;
export async function getMongoClient(): Promise<mongodb.MongoClient> {
  if (!client) {
    client = new mongodb.MongoClient(connectStr, {
      useNewUrlParser: true,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 1000,
      autoReconnect: true,
      poolSize: 10
    });
    await client.connect();
  }
  return client;
}

export async function closeMongoClient(): Promise<void> {
  if (client && client.isConnected()) {
    await client.close();
    client = undefined;
  }
}

export async function getCollection(name: string): Promise<mongodb.Collection> {
  let client = await getMongoClient();
  return client.db(dbName).collection(name);
}

export function getObjectId(id: string) {
  return new mongodb.ObjectId(id);
}

export async function dropDatabase(): Promise<void> {
  let client = await getMongoClient();
  client.db(dbName).dropDatabase();
}
