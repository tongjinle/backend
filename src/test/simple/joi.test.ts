import assert = require("assert");
import * as joi from "@hapi/joi";

describe("demo", () => {
  it("joi", () => {
    let tong = { name: "tongjinle", age: 30 };
    let monster = { name: "monster", age: 500 };
    let wang = { name: "wanghaixia" };

    let schema = {
      name: joi.string().required(),
      age: joi.number().max(100)
    };

    let expects = [true, false, false];
    [tong, monster, wang].forEach((n, i) => {
      let rst = joi.validate(tong, schema);
      // assert((rst.error === null) === expects[i]);
      console.log(i, rst.error);
    });
  });
});
