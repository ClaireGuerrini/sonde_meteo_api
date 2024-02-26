var express = require("express");
var router = express.Router();
const fs = require("fs");
require("dotenv").config();
const cors = require('cors');
router.use(cors()); 
const nmea = require("@drivetech/node-nmea");
const { InfluxDB, Point } = require("@influxdata/influxdb-client");
// const count = fluxFunction("count"); 
const e = require("express");
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
  const interval = req.query.interval || "1h";
  const currentDate = new Date();
  console.log(filter);

  let intervalUnit = interval.charAt(interval.length - 1);
  let intervalValue = interval.substring(0, interval.length - 1);



  if (intervalUnit == "h") {
    intervalValue = intervalValue * 60;
  }
  else if (intervalUnit == "s") {
    intervalValue = intervalValue / 60;
    
  }
  else if (intervalUnit == "D") {
    intervalValue = intervalValue * 1440;
  }
  else if (intervalUnit == "M") {
    intervalValue = intervalValue * 43200;
  }
  else if (intervalUnit == "Y") {
    intervalValue = intervalValue * 525600;
  }
  else if (intervalUnit == "m") {
    intervalValue = intervalValue;
  }
  else {
    intervalValue = 10;
  }

  if (intervalValue < 1) {
    intervalValue = 1;
  }
  let diffFrom = currentDate - from;
  let diffTo = currentDate - to;

  from = Math.round(diffFrom / 60000);
  to = Math.round(diffTo / 60000);

    const queries = [];
    let fluxQuery = `from(bucket: "weather_data")
  |> range(start: -${from}m , stop: -${to}m)
    |> filter(fn: (r) => r._measurement == "weather" )
    |> filter(fn: (r) => r._field == "wind_speed_avg" or r._field == "wind_heading" or r._field == "temperature" or r._field == "pressure" or r._field == "luminosity" or r._field == "lat" or r._field == "lon" or r._field == "date_location" or r._field == "date_measure" or r._field == "humidity")
    |> aggregateWindow(every: ${intervalValue}m, fn: first, createEmpty: false)
    |> limit(n: 1000)

    `;
    const data = {};
    queries.push(new Promise((resolve, reject) => {
      queryClient.queryRows(fluxQuery, {
        next: (row, tableMeta) => {
          const tableObject = tableMeta.toObject(row);
          if (data[`${tableObject._field}`] === undefined) {
            data[`${tableObject._field}`] = [tableObject._value];
          } else {
            data[`${tableObject._field}`].push(tableObject._value);
          }
        },
        error: (error) => {
          console.error("\nError", error);
          reject(error);
        },
        complete: () => {
          console.log("\nSuccess");
          resolve();
        },
      });
    }));

    fluxQuery = `from(bucket: "weather_data")
  |> range(start: -${from}m , stop: -${to}m)
  |> filter(fn: (r) => r._measurement == "weather" )
  |> filter(fn: (r) => r._field == "date_lastrain")
  |> count()
  |> limit(n: 1000)
  `;
  queries.push(new Promise((resolve, reject) => {
    queryClient.queryRows(fluxQuery, {
      next: (row, tableMeta) => {
        const tableObject = tableMeta.toObject(row);
        data[`${tableObject._field}`] = tableObject._value
      },
      error: (error) => {
        console.error("\nError", error);
        reject(error);
      },
      complete: () => {
        console.log("\nSuccess");
        resolve();
      },
    });
  }));

  Promise.all(queries)
  .then(() => {
    coords = []
    for (let i = 0; i < data.lat.length; i++){
      coords.push([data.lat[i],data.lon[i]])
    }
      
    const formatedData = {}
    formatedData.name = "piensg031"
    formatedData.status = true
    formatedData.location = {
      "date ": data.date_location,
      "coords": coords
    }
    formatedData.measurements = {}
    formatedData.measurements.date = data.date_measure
    if ( !filter.length || filter.find((item) => item == "all") || filter.find((item) => item == "pressure") ){
      formatedData.measurements.pressure = data.pressure
    }
    if ( !filter.length || filter.find((item) => item == "all") || filter.find((item) => item == "temperature") ){
      formatedData.measurements.temperature = data.temperature
    }
    if ( !filter.length || filter.find((item) => item == "all") || filter.find((item) => item == "rain") ){
      formatedData.measurements.rain = data.date_lastrain * 0.3274
    }
    if ( !filter.length || filter.find((item) => item == "all") || filter.find((item) => item == "wind") ){
      formatedData.measurements.wind= {
        "speed ": data.wind_speed_avg,
        "direction": data.wind_heading
      }
    }
    if ( !filter.length || filter.find((item) => item == "all") || filter.find((item) => item == "light") ){
      formatedData.measurements.light = data.luminosity
    }
    if ( !filter.length || filter.find((item) => item == "all") || filter.find((item) => item == "humidity") ){
      formatedData.measurements.humidity = data.humidity
    }
      res.json(formatedData);
      console.log("\nSuccess");  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('An error occurred while processing the request.');
  });   
  

})

module.exports = router;
