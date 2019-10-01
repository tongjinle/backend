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

  async start(): Promise<void> {
    this.app = express();

    Promise.all([this.initRoute(), this.bindMongo(), this.bindRedis()]).then(
      () => {
        process.send && process.send("server start");
      }
    );
  }

  private bindMongo() {
    return new Promise(resolve => {
      getMongoClient().then(client => {
        this.mongoClient = client;
        resolve();
      });
    });
  }

  private bindRedis() {
    return new Promise(resolve => {
      getRedisClient().then(client => {
        this.redisClient = client;
        resolve();
      });
    });
  }

  // 挂载路由
  initRoute(): Promise<void> {
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
    };

    // return new Promise(resolve => {
    //   console.log("on pre launch...");
    //   app.listen(port, () => {
    //     console.log("on launch...");
    //     cb();
    //     resolve();
    //   });
    // });
    app.listen(port, cb);
    return;
  }
}

try {
  let serv = new Main();
  serv.start();
} catch (e) {
  console.log(e);
}

function uncaughtExceptionHandler(err) {
  console.error("uncaughtException", err);
  // if (err && err.code == "ECONNREFUSED") {
  //do someting
  // } else {
  // process.exit(1);
  // }
}
process.on("uncaughtException", uncaughtExceptionHandler);
