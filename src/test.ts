import db from "./db";
import * as mongodb from "mongodb";
import getMongoClient from "./getMongoClient";

async function main() {
  for (let i = 0; i < 10; i++) {
    // let client = await db.getIns();
    // await client.close();
    // let client = new mongodb.MongoClient("mongodb://118.31.11.29:27017");
    // await client.connect();
    // await client.close();

    let client = await getMongoClient();
    await client.connect();
    await client.close();
  }
}

main();
