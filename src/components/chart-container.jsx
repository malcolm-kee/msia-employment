import React from 'react';
import * as d3 from 'd3';
import outsideLabourData from '../../data/outside_labour_by_state.json';
import unemploymentData from '../../data/unemployment_by_state.json';
import { LineGraph } from './line-graph';

const outsideLabourSummary = d3
  .nest()
  .key(d => d.year)
  .sortKeys(d3.ascending)
  .rollup(leaves => leaves.reduce((total, d) => total + d.outsideLabour, 0))
  .entries(outsideLabourData)
  .map(d => ({
    key: Number(d.key),
    value: d.value
  }));

const unemploymentSummary = d3
  .nest()
  .key(d => d.year)
  .sortKeys(d3.ascending)
  .rollup(leaves => leaves.reduce((total, d) => total + d.unemployed, 0))
  .entries(unemploymentData)
  .map(d => ({
    key: Number(d.key),
    value: d.value
  }));

export class ChartContainer extends React.Component {
  render() {
    return (
      <div>
        <LineGraph
          title="Outside Labour & Unemployment"
          labourData={outsideLabourSummary}
          unemploymentData={unemploymentSummary}
          setRange={this.handleSetFilter}
          range={this.state.range}
        />
      </div>
    );
  }

  handleSetFilter = range => this.setState({ range });

  state = {
    range: []
  };
}
