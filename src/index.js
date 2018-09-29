import React from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import outsideLabourData from "../data/outside_labour_by_state.json";
import unemploymentData from "../data/unemployment_by_state.json";
import { LineGraph } from "./components/line-graph";

const outsideLabourSummary = d3
  .nest()
  .key(d => d.year)
  .sortKeys(d3.ascending)
  .rollup(leaves => leaves.reduce((total, d) => total + d.outsideLabour, 0))
  .entries(outsideLabourData);

const unemploymentSummary = d3
  .nest()
  .key(d => d.year)
  .sortKeys(d3.ascending)
  .rollup(leaves => leaves.reduce((total, d) => total + d.unemployed, 0))
  .entries(unemploymentData);

ReactDOM.render(
  <LineGraph
    title="Outside Labour & Unemployment (1985-2015)"
    labourData={outsideLabourSummary}
    unemploymentData={unemploymentSummary}
  />,
  document.getElementById("app")
);
