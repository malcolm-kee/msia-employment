import React from 'react';
import * as d3 from 'd3';
import { noop } from '../util/fn-util';
import './bar-chart.css';

const WIDTH = 1000;
const HEIGHT = 200;
const MARGIN = {
  top: 0,
  left: 40,
  right: 0,
  bottom: 40
};

export class BarChart extends React.Component {
  render() {
    const props = this.props;
    return (
      <section className="bar-chart">
        <h2 className="bar-chart--title">
          {props.title} ({this.state.minYear}-{this.state.maxYear})
        </h2>
        <div className="bar-chart--chart-container">
          <svg
            className="bar-chart--chart"
            width={WIDTH}
            height={HEIGHT}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          >
            {this.state.data.map(d => (
              <rect fill="blue" stroke="white" key={d.x} {...d} />
            ))}
            <g
              ref={ref => (this.xAxisRef = ref)}
              transform={`translate(0, ${HEIGHT - MARGIN.bottom})`}
            />
            <g ref={ref => (this.yAxisRef = ref)} transform={`translate(${MARGIN.left}, 0)`} />
          </svg>
        </div>
      </section>
    );
  }

  static getDerivedStateFromProps(props) {
    const { data } = props;
    const dataSummary = d3
      .nest()
      .key(d => d.state)
      .rollup(leaves => leaves.reduce((total, d) => total + d.value, 0))
      .entries(data);

    const yearExtent = d3.extent(data, d => d.year);

    const stateScale = d3
      .scaleBand()
      .domain(dataSummary.map(d => d.key))
      .range([MARGIN.left, WIDTH - MARGIN.right]);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(dataSummary, d => d.value))
      .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

    const width = stateScale.bandwidth();

    return {
      stateScale,
      yScale,
      minYear: yearExtent[0],
      maxYear: yearExtent[1],
      data: dataSummary.map(d => ({
        width,
        height: HEIGHT - MARGIN.bottom - yScale(d.value),
        x: stateScale(d.key),
        y: yScale(d.value)
      }))
    };
  }

  state = {
    data: [],
    stateScale: noop,
    yScale: noop,
    minYear: '',
    maxYear: ''
  };

  xAxis = d3.axisBottom();

  yAxis = d3
    .axisLeft()
    .ticks(5)
    .tickFormat(d3.format('.2s'));

  refreshScale = () => {
    this.xAxis.scale(this.state.stateScale);
    d3.select(this.xAxisRef).call(this.xAxis);

    this.yAxis.scale(this.state.yScale);
    d3.select(this.yAxisRef).call(this.yAxis);
  };

  componentDidMount() {
    this.refreshScale();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data.length !== this.props.data.length) {
      this.refreshScale();
    }
  }
}
