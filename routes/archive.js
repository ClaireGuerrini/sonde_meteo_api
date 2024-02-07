var express = require("express");
var router = express.Router();
const fs = require("fs");
require("dotenv").config();
const nmea = require("@drivetech/node-nmea");
const { InfluxDB, Point } = require("@influxdata/influxdb-client");
const { allowedNodeEnvironmentFlags } = require("process");

const token = `${process.env.INFLUXDB_TOKEN}`;
const url = "http://localhost:8086";

let org = `projet_sonde`;
let bucket = `weather_data`;
const client = new InfluxDB({ url, token });

let queryClient = client.getQueryApi(org);

router.get("/", function (req, res, next) {
  let from = new Date(req.query.from);
  let to = req.query.to ? new Date(req.query.to) : new Date();
  const filter = req.query.filter ? req.query.filter.split(",") : [];
  const interval = req.query.interval || "5.7h";
  const currentDate = new Date();
  console.log(filter);

  let diffFrom = currentDate - from;
  let diffTo = currentDate - to;

  from = Math.round(diffFrom / 60000);
  to = Math.round(diffTo / 60000);
  console.log(filter);
  if (!filter.length) {
    console.log("got into here");
    let fluxQuery = `from(bucket: "weather_data")
  |> range(start: -${from}m , stop: -${to}m)
    |> filter(fn: (r) => r._measurement == "weather" )

    `;
    const data = {};

    queryClient.queryRows(fluxQuery, {
      next: (row, tableMeta) => {
        const tableObject = tableMeta.toObject(row);
        console.log(data[`${tableObject._field}`]);
        if (data[`${tableObject._field}`] === undefined) {
          data[`${tableObject._field}`] = [tableObject._value];
        } else {
          data[`${tableObject._field}`].push(tableObject._value);
        }
      },
      error: (error) => {
        console.error("\nError", error);
      },
      complete: () => {
        res.json(data);
        console.log("\nSuccess");
      },
    });
  } else if (filter.find((item) => item == "all")) {
    let fluxQuery = `from(bucket: "weather_data")
  |> range(start: -${from}m , stop: -${to}m)
    |> filter(fn: (r) => r._measurement == "weather" )

    `;
    const data = {};

    queryClient.queryRows(fluxQuery, {
      next: (row, tableMeta) => {
        const tableObject = tableMeta.toObject(row);
        console.log(data[`${tableObject._field}`]);
        if (data[`${tableObject._field}`] === undefined) {
          data[`${tableObject._field}`] = [tableObject._value];
        } else {
          data[`${tableObject._field}`].push(tableObject._value);
        }
      },
      error: (error) => {
        console.error("\nError", error);
      },
      complete: () => {
        res.json(data);
        console.log("\nSuccess");
      },
    });
  } else {
    let new_data = {};
    if (filter.find((item) => item == "temperature")) {
      let fluxQuery = `from(bucket: "weather_data")
    |> range(start: -${from}m , stop: -${to}m)
    |> filter(fn: (r) => r._field == "temperature")
  
      `;
      queryClient.queryRows(fluxQuery, {
        next: (row, tableMeta) => {
          const tableObject = tableMeta.toObject(row);
          if (new_data[`${tableObject._field}`] === undefined) {
            new_data[`${tableObject._field}`] = [tableObject._value];
          } else {
            new_data[`${tableObject._field}`].push(tableObject._value);
          }
        },
        error: (error) => {
          console.error("\nError", error);
        },
        complete: () => {
          console.log("\nSuccess");
        },
      });
    }
    if (filter.find((item) => item == "rain")) {
      let fluxQuery = `from(bucket: "weather_data")
    |> range(start: -${from}m , stop: -${to}m)
    |> filter(fn: (r) => r._field == "date_lastrain")
  
      `;

      queryClient.queryRows(fluxQuery, {
        next: (row, tableMeta) => {
          const tableObject = tableMeta.toObject(row);
          if (new_data[`${tableObject._field}`] === undefined) {
            new_data[`${tableObject._field}`] = [tableObject._value];
          } else {
            new_data[`${tableObject._field}`].push(tableObject._value);
          }
        },
        error: (error) => {
          console.error("\nError", error);
        },
        complete: () => {
          console.log("\nSuccess");
        },
      });
    }
    if (filter.find((item) => item == "humidity")) {
      let fluxQuery = `from(bucket: "weather_data")
    |> range(start: -${from}m , stop: -${to}m)
    |> filter(fn: (r) => r._field == "humidity")
  
      `;

      queryClient.queryRows(fluxQuery, {
        next: (row, tableMeta) => {
          const tableObject = tableMeta.toObject(row);
          if (new_data[`${tableObject._field}`] === undefined) {
            new_data[`${tableObject._field}`] = [tableObject._value];
          } else {
            new_data[`${tableObject._field}`].push(tableObject._value);
          }
        },
        error: (error) => {
          console.error("\nError", error);
        },
        complete: () => {
          console.log("\nSuccess");
        },
      });
    }
    if (filter.find((item) => item == "pressure")) {
      let fluxQuery = `from(bucket: "weather_data")
    |> range(start: -${from}m , stop: -${to}m)
    |> filter(fn: (r) => r._field == "pressure")
  
      `;

      queryClient.queryRows(fluxQuery, {
        next: (row, tableMeta) => {
          const tableObject = tableMeta.toObject(row);
          if (new_data[`${tableObject._field}`] === undefined) {
            new_data[`${tableObject._field}`] = [tableObject._value];
          } else {
            new_data[`${tableObject._field}`].push(tableObject._value);
          }
        },
        error: (error) => {
          console.error("\nError", error);
        },
        complete: () => {
          console.log("\nSuccess");
        },
      });
    }
    if (filter.find((item) => item == "wind")) {
      let fluxQuery = `from(bucket: "weather_data")
    |> range(start: -${from}m , stop: -${to}m)
    |> filter(fn: (r) => r._field == "wind_heading" or r._field =="wind_speed_avg" )
  
      `;

      queryClient.queryRows(fluxQuery, {
        next: (row, tableMeta) => {
          const tableObject = tableMeta.toObject(row);
          if (new_data[`${tableObject._field}`] === undefined) {
            new_data[`${tableObject._field}`] = [tableObject._value];
          } else {
            new_data[`${tableObject._field}`].push(tableObject._value);
          }
        },
        error: (error) => {
          console.error("\nError", error);
        },
        complete: () => {
          console.log("\nSuccess");
        },
      });
    }
    if (filter.find((item) => item == "light")) {
      let fluxQuery = `from(bucket: "weather_data")
    |> range(start: -${from}m , stop: -${to}m)
    |> filter(fn: (r) => r._field == "luminosity")
  
      `;

      queryClient.queryRows(fluxQuery, {
        next: (row, tableMeta) => {
          const tableObject = tableMeta.toObject(row);
          if (new_data[`${tableObject._field}`] === undefined) {
            new_data[`${tableObject._field}`] = [tableObject._value];
          } else {
            new_data[`${tableObject._field}`].push(tableObject._value);
          }
        },
        error: (error) => {
          console.error("\nError", error);
        },
        complete: () => {
          console.log("\nSuccess");
        },
      });
    }
    console.log(new_data);
    res.json(new_data);
  }
});

module.exports = router;
