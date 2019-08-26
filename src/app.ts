import * as Http from "http";
import * as Https from "https";
import * as express from "express";
import * as fs from "fs";
import * as path from "path";
// https://www.jianshu.com/p/cd3de110b4b6
import * as bodyParser from "body-parser";

import loger from "./logIns";
import config from "./config";
import { getMongoClient } from "./mongo";

import httpRouteHandle from "./routes/httpRoute";
import * as mongodb from "mongodb";

class Main {
  app: express.Express;
  server: Http.Server;
  client: mongodb.MongoClient;
  constructor() {
    let app = (this.app = express());

    this.initRoute();
    this.bindMongo();
  }

  bindMongo() {
    getMongoClient().then(client => {
      this.client = client;
    });
  }

  // 挂载路由
  initRoute(): void {
    let app = this.app;

    // 中间件
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // 静态文件
    app.use("/static", express.static(path.join(__dirname, "./public")));

    // 过滤掉option
    app.use((req, res, next) => {
      loger.info("req.path", req.path, req.method);
      // 在跨域的请求发生的时候,post请求之前会产生一个option请求
      if (req.method == "OPTIONS") {
        next();
        return;
      }

      next();
    });

    // cors
    app.all("*", (req: express.Request, res: express.Response, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      next();
    });

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
        console.log(
          `visit TEST: ${config.protocol}://${config.host}:${config.port}/test`
        );
        console.log(
          `visit DB: ${config.protocol}://${config.host}:${config.port}/test/db`
        );
        console.log(
          `visit STATIC: ${config.protocol}://${config.host}:${config.port}/static/test.jpg`
        );
      }
    };

    app.listen(port, cb);
  }
}

new Main();
