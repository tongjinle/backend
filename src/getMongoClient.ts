import * as mongodb from "mongodb";
import config from "./config/index";

let client: mongodb.MongoClient;

export async function getMongoClient(): Promise<mongodb.MongoClient> {
  if (!client) {
    client = new mongodb.MongoClient(config.connectStr, {
      useNewUrlParser: true
    });
    await client.connect();
  }

  return client;
}

export async function closeMongoClient() {
  if (client) {
    await client.close(true);
  }
  client = undefined;
}
