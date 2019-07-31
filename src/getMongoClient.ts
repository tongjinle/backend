import * as mongodb from "mongodb";
import config from "./config/index";

let client: mongodb.MongoClient;
export async function getMongoClient(): Promise<mongodb.MongoClient> {
  if (!client) {
    client = new mongodb.MongoClient(config.connectStr, {
      useNewUrlParser: true
    });
    // await client.
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
  return client.db(config.dbName).collection(name);
}
