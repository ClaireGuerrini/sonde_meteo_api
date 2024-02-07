var express = require('express');
var router = express.Router();
const fs = require("fs");
require('dotenv').config()
const nmea = require('@drivetech/node-nmea')
const {InfluxDB, Point} = require('@influxdata/influxdb-client')

const token = `${process.env.INFLUXDB_TOKEN}`
const url = 'http://localhost:8086'

let org = `projet_sonde`
let bucket = `weather_data`
const client = new InfluxDB({url, token})

let queryClient = client.getQueryApi(org)

router.get('/', function(req, res, next) {
  let from = new Date(req.query.from);
  let to = req.query.to ? new Date(req.query.to) : new Date();
  const filter = req.query.filter ? req.query.filter.split(',') : [];
  const interval = req.query.interval || '5.7h';
  const currentDate = new Date()
  console.log(from)

let diffFrom = (currentDate - from); 
let diffTo = (currentDate - to);

from = Math.round(diffFrom  / 60000);
console.log(from)
to = Math.round(diffTo / 60000);
console.log(to)
  let fluxQuery = `from(bucket: "weather_data")
  |> range(start: -${from}m , stop: -${to}m)
    |> filter(fn: (r) => r._measurement == "weather" )

    `

  const data = {}

  queryClient.queryRows(fluxQuery, {
    next: (row, tableMeta) => {
      const tableObject = tableMeta.toObject(row)
      console.log(data[`${tableObject._field}`] )
      if (data[`${tableObject._field}`] === undefined) {
        data[`${tableObject._field}`] = [tableObject._value];
      } else {
        data[`${tableObject._field}`].push(tableObject._value);
      }    },
    error: (error) => {
      console.error('\nError', error)
    },
    complete: () => {
      res.json(data);
      console.log('\nSuccess')
    },
  })
});

module.exports = router;