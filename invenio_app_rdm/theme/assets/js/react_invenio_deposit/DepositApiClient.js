import _isEmpty from "lodash/isEmpty";
export class DepositApiClient {
  create(record) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        var newRecord = {
          id: "1",
          links: {
            edit: "/deposit/1/edit",
          },
          ...record,
        };
        console.log("Record created", newRecord);
        resolve(newRecord);
      }, 100);
    });
  }

  save(record) {
    // For now save always returns a record
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log("Record saved", record);
        resolve({ data: record });
      }, 500);
    });
  }

  publish(record) {
    // For now publish returns an error when titles array is empty
    // This has the shape of what our current API returns when there are errors
    // in the API call
    let response = null;
    if (_isEmpty(record["titles"])) {
      response = {
        status: 400,
        message: "Validation error.",
        errors: [
          {
            parents: ["titles", "0"],
            field: "title",
            message: "Missing data for required field.",
          },
        ],
      };
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(response);
        }, 500);
      });
    } else {
      response = {
        status: 200,
        data: record,
      };
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(response);
        }, 500);
      });
    }
  }
}
