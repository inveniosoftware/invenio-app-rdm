import isEmpty from "lodash/isEmpty";

import { http } from "../http";

export class DepositAPI {
  constructor(config){
    this.config = config || {};
  }

  save(record) {
    return new Promise((resolve, reject) => {
      if (Math.random() * 100 < 33) {
        reject("Backend Error");
      } else {
        resolve("Success");
      }
    });
  }
}
