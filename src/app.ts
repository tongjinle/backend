import * as Http from "http";
import * as express from "express";
import * as cors from "cors";
import * as path from "path";
// https://www.jianshu.com/p/cd3de110b4b6
import * as bodyParser from "body-parser";
import internalIp from "internal-ip";

import loger from "./logIns";
import config from "./config";

import httpRouteHandle from "./routes/httpRoute";
import * as redis from "handy-redis";
import * as mongodb from "mongodb";
import { getRedisClient } from "./redis";
import { getMongoClient } from "./mongo";

class Main {
  app: express.Express;
  server: Http.Server;
  mongoClient: mongodb.MongoClient;
  redisClient: redis.IHandyRedis;

  constructor() {
    this.app = express();
    this.initRoute();
    this.bindMongo();
    this.bindRedis();
  }

  private bindMongo() {
    getMongoClient().then(client => {
      this.mongoClient = client;
    });
  }

  private bindRedis() {
    getRedisClient().then(client => {
      this.redisClient = client;
    });
  }

  // 挂载路由
  initRoute(): void {
    let app = this.app;

    // 静态文件
    app.use("/static", express.static(path.join(__dirname, "./public")));
    // 中间件
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // cors
    app.use(cors());

    // 路由
    httpRouteHandle(app);

    // 启动
    let { port } = config;
    let cb = () => {
      console.log("=======================================");
      console.log(new Date());
      console.log(`** start https server at port(${port}) **`);
      console.log("=======================================");

      if (process.env.NODE_ENV !== "product") {
        let host = internalIp.v4.sync();
        console.log(
          `visit TEST: ${config.protocol}://${host}:${config.port}/test`
        );
        console.log(
          `visit DB: ${config.protocol}://${host}:${config.port}/test/db`
        );
        console.log(
          `visit STATIC: ${config.protocol}://${host}:${config.port}/static/test.jpg`
        );
        if (process.env.NODE_ENV === "dev") {
          console.log(
            `recover DATA: ${config.protocol}://${host}:${config.port}/test/recover`
          );
        }
      }

      process.send("server start");
    };

    app.listen(port, cb);
  }
}

new Main();

function uncaughtExceptionHandler(err) {
  console.error("uncaughtException", err);
  // if (err && err.code == "ECONNREFUSED") {
  //do someting
  // } else {
  // process.exit(1);
  // }
}
process.on("uncaughtException", uncaughtExceptionHandler);
