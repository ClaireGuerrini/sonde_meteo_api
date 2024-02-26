var express = require('express');
var router = express.Router();
const fs = require("fs");
const nmea = require('@drivetech/node-nmea')
const {InfluxDB, Point} = require('@influxdata/influxdb-client')
require('dotenv').config()
const cors = require('cors');
router.use(cors()); 


const token = `${process.env.INFLUXDB_TOKEN}`

const url = 'http://localhost:8086'



let org = `projet_sonde`
let bucket = `weather_data`
const client = new InfluxDB({url, token})

let queryClient = client.getQueryApi(org)

/* GET users listing. */
router.get('/', function(req, res, next) {
  
  const ptdr = req.query.ptdr || null
  console.log(ptdr)
  
  let fluxQuery = `from(bucket: "weather_data")
    |> range(start: -30d)
    |> last()
    |> filter(fn: (r) => r._measurement == "weather")
    `

  if (ptdr != null) {
    fluxQuery += `
    |> filter(fn: (r) => r._field == "date_measure" or r._field =="pressure" 
    or r._field =="temperature" or r._field =="date_lastrain"
    or r._field =="lat" or r._field =="lon")
    `
    console.log(fluxQuery)

  }
  

  const data = {}
  
  queryClient.queryRows(fluxQuery, {
    next: (row, tableMeta) => {
      const tableObject = tableMeta.toObject(row)
      data[`${tableObject._field}`] = tableObject._value

    },
    error: (error) => {
      console.error('\nError', error)
    },
    complete: () => {

      const formatedData = {}
      formatedData.name = "piensg031"
      formatedData.status = true
      console.log(data.date_location)
      formatedData.location = {
        "date ": data.date_location,
        "coords": [data.lat,data.lon]
      }
      formatedData.measurements = {}
      formatedData.measurements.date = data.date_measure
      formatedData.measurements.pressure = data.pressure
      formatedData.measurements.temperature = data.temperature
      formatedData.measurements.rain = data.date_lastrain
      if (ptdr == null) {
        formatedData.measurements.wind= {
          "speed ": data.wind_speed_avg,
          "direction": data.wind_heading
        }
      }
      
      formatedData.measurements.light = data.luminosity
      formatedData.measurements.humidity = data.humidity


      // console.log(data)
      res.json(formatedData);
      
      console.log('\nSuccess')
    },
  })

  

});

module.exports = router;
