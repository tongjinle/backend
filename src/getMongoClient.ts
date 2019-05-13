import mongodb, { MongoClient } from "mongodb";
import config from "./config";

let client: MongoClient;
async function getMongoClient() {
  // if (!client) {
  //   client = new MongoClient(config.connectStr);
  // }
  // return client;
  return new MongoClient(config.connectStr);
}

export default getMongoClient;
