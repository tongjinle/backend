import { dropDatabase } from "../../mongo";
import { getRedisClient } from "../../redis";

export default async function clean() {
  {
    await dropDatabase();
  }

  {
    let client = await getRedisClient();
    await client.flushdb();
  }
}
