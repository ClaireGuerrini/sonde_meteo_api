var express = require('express');
var router = express.Router();
const fs = require("fs");
const nmea = require('@drivetech/node-nmea')
const {InfluxDB, Point} = require('@influxdata/influxdb-client')

const token = process.env.INFLUXDB_TOKEN
const url = 'http://localhost:8086'



let org = `test`
let bucket = `new_test`
const client = new InfluxDB({url, token})

let queryClient = client.getQueryApi(org)

/* GET users listing. */
router.get('/', function(req, res, next) {
  

  
  let fluxQuery = `from(bucket: "new_test")
    |> range(start: -30d)
    |> last()
    |> filter(fn: (r) => r._measurement == "weather")
    `

  const data = {}

  queryClient.queryRows(fluxQuery, {
    next: (row, tableMeta) => {
      const tableObject = tableMeta.toObject(row)
      data[`${tableObject._field}`] = tableObject._value
      // console.log(tableObject)
      // res.send(tableObject);
      console.log(data)
      
      // res.send("bob")
    },
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
