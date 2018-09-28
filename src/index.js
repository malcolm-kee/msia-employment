import React from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import outsideLabourData from "../data/outside_labour_by_state.json";
import { LineGraph } from "./components/line-graph";

const labourSummary = d3
  .nest()
  .key(d => d.year)
  .sortKeys(d3.ascending)
  .rollup(leaves => leaves.reduce((total, d) => total + d.outsideLabour, 0))
  .entries(outsideLabourData);

ReactDOM.render(
  <LineGraph inputData={labourSummary} />,
  document.getElementById("app")
);
