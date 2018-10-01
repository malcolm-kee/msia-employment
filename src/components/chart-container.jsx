import React from 'react';
import * as d3 from 'd3';
import outsideLabourRawData from '../../data/outside_labour_by_state.json';
import unemploymentRawData from '../../data/unemployment_by_state.json';
import { BarChart } from './bar-chart';
import { LineGraph } from './line-graph';

const outsideLabourData = outsideLabourRawData.filter(d => d.state !== 'Malaysia');
const unemploymentData = unemploymentRawData.filter(d => d.state !== 'Malaysia');

const outsideLabourSummary = d3
  .nest()
  .key(d => d.year)
  .sortKeys(d3.ascending)
  .rollup(leaves => leaves.reduce((total, d) => total + d.value, 0))
  .entries(outsideLabourData)
  .map(d => ({
    key: Number(d.key),
    value: d.value
  }));

const unemploymentSummary = d3
  .nest()
  .key(d => d.year)
  .sortKeys(d3.ascending)
  .rollup(leaves => leaves.reduce((total, d) => total + d.value, 0))
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
        <BarChart
          title="Outside Labour for each state"
          data={this.state.filteredLabourData}
          range={this.state.range}
          fillColor="purple"
        />
        <BarChart
          title="Unemployment for each state"
          data={this.state.filteredUnemploymentData}
          range={this.state.range}
          fillColor="blue"
        />
      </div>
    );
  }

  handleSetFilter = range =>
    this.setState({
      range,
      filteredLabourData: outsideLabourData.filter(d => range[0] <= d.year && d.year <= range[1]),
      filteredUnemploymentData: unemploymentData.filter(
        d => range[0] <= d.year && d.year <= range[1]
      )
    });

  state = {
    range: [],
    filteredLabourData: outsideLabourData,
    filteredUnemploymentData: unemploymentData
  };
}
