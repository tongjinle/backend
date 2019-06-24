import * as mongodb from "mongodb";
import config from "./config/index";
import { func } from "@hapi/joi";

let client: mongodb.MongoClient;
export async function getMongoClient(): Promise<mongodb.MongoClient> {
  if (!client) {
    client = new mongodb.MongoClient(config.connectStr);
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
