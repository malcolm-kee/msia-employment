const csvtojson = require("csvtojson");
const fs = require("fs");

function csvToJsonFile(csvFilePath, jsonFileName, dataMapper) {
  csvtojson()
    .fromFile(csvFilePath)
    .then(
      jsonObj =>
        new Promise(fulfill => {
          const data = jsonObj.map(dataMapper);
          fs.writeFile(jsonFileName, JSON.stringify(data), "utf-8", fulfill);
        })
    );
}

csvToJsonFile(
  "./bptms_Unemployed_by_state.csv",
  "unemployment_by_state.json",
  d => ({
    state: d.state,
    year: Number(d.year),
    unemployed: Number(d["Unemployed ('000)"]) * 1000
  })
);
csvToJsonFile(
  "./bptms_Outside_labour_force_by_state.csv",
  "outside_labour_by_state.json",
  d => ({
    state: d.state,
    year: Number(d.year),
    outsideLabour: Number(d["Outside Labour Force ('000)"]) * 1000
  })
);
