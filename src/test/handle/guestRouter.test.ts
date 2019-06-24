import assert = require("assert");
import { getMongoClient, closeMongoClient } from "../../getMongoClient";
import { MongoClient, Collection } from "mongodb";
import config from "../../config";
import axios, { AxiosInstance } from "axios";
import { func } from "@hapi/joi";
import errs from "../../errCode";

describe("guest router", async function() {
  let request: AxiosInstance;
  let client: MongoClient;
  let collection: Collection;
  before(async function() {
    request = axios.create({
      baseURL: `${config.protocol}://${config.host}:${config.port}`
    });

    client = await getMongoClient();
    collection = client.db(config.dbName).collection("photo");
  });

  beforeEach(async function() {
    // 清理所有数据
    await collection.deleteMany({});

    await collection.insertMany([
      { id: "1", score: 100, url: "url1", nickname: "三年", userId: "sannian" },
      { id: "2", score: 90, url: "url2", nickname: "三年", userId: "sannian" },
      { id: "3", score: 90, url: "url2", nickname: "周淑婷", userId: "zst" }
    ]);
  });

  afterEach(async function() {});

  after(async function() {
    await closeMongoClient();
  });

  it("sort", async function() {
    let res = await request.get("/sort/");
    assert(res.data.code === 0);
    assert(res.data.list.length == 3);
    assert(res.data.list[0].id === "1");
  });

  it("search", async function() {
    let res = await request.get("/search/", {
      params: {
        id: "1"
      }
    });

    assert(res.data.code === 0 && res.data.id === "1");
  });

  it("search.fail", async function() {
    let res = await request.get("/search/", {
      params: {
        id: "-1"
      }
    });

    assert(res.data.code === errs.photo.noExists.code);
  });
});
