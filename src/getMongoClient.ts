import * as mongodb from "mongodb";
import config from "./config/index";

async function getMongoClient(): Promise<mongodb.MongoClient> {
  return new mongodb.MongoClient(config.connectStr);
}

export default getMongoClient;
