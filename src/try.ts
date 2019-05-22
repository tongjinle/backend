import getMongoClient from "./getMongoClient";

async function main() {
  let client = await getMongoClient();
  await client.connect();
  await client.close();
}

main();
