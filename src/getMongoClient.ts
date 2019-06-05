import * as mongodb from "mongodb";
import config from "./config/index";

let client: mongodb.MongoClient;

async function getMongoClient(): Promise<mongodb.MongoClient> {
  if (!client) {
    client = new mongodb.MongoClient(config.connectStr);
    await client.connect();
  }
  return client;
}

export default getMongoClient;
