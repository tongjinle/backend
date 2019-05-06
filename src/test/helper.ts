import Database from "../db";
import axios from "axios";
import config from "../config";

let db: Database;
let collections = [];

let clearAll = async () => {
  await open();
  await Promise.all(
    collections.map(async n => {
      await db.getCollection(n).deleteMany({});
    })
  );
};

let clearToken = async () => {
  await open();
  await db.getCollection("token").deleteMany({});
};

let open = async () => {
  db = await Database.getIns();
};

let close = async () => {
  await db.close();
};

let getAxios = async () => {
  // token service
  return axios.create({
    baseURL: `${config.protocol}://${config.host}:${config.port}`
  });
};

export default {
  clearAll,
  open,
  close,

  // get axios instance
  // with token
  getAxios,

  // clean token
  clearToken
};
