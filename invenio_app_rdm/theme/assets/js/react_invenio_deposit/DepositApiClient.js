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
        resolve({ ...record });
      }, 500);
    });
  }

  publish(record) {
    // For now publish always returns an error
    // This has the shape of what our current API returns when there are errors
    // in the API call
    const error = {
      status: 400,
      message: "Validation error.",
      errors: [
        {
          parents: [],
          field: "resource_type",
          message: "Missing data for required field.",
        },
        {
          parents: ["titles", "0"],
          field: "title",
          message: "Missing data for required field.",
        },
      ],
    };

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(error);
      }, 500);
    });
  }
}
