import React from 'react';
import * as d3 from 'd3';
import { legendColor } from 'd3-svg-legend';
import { noop } from '../util/fn-util';
import './line-graph.css';

const WIDTH = 800;
const HEIGHT = 500;
const MARGIN = {
  top: 40,
  left: 40,
  right: 20,
  bottom: 40
};

const ordinal = d3
  .scaleOrdinal()
  .domain(['Outside Label', 'Unemployment'])
  .range(['purple', 'blue']);

const legendOrdinal = legendColor()
  .shape(
    'path',
    d3
      .symbol()
      .type(d3.symbolSquare)
      .size(150)()
  )
  .shapePadding(10)
  .scale(ordinal);

export class LineGraph extends React.Component {
  render() {
    const props = this.props;
    return (
      <div className="line-graph">
        <div className="line-graph--title">
          <h2>{props.title}</h2>
        </div>
        <div className="line-graph--chart-container">
          <svg
            className="line-graph--chart"
            width={WIDTH}
            height={HEIGHT}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          >
            <path d={this.state.labourLineData} fill="none" strokeWidth={1.5} stroke="purple" />
            <path d={this.state.unemploymentLineData} fill="none" strokeWidth={1.5} stroke="blue" />
            <g
              ref={ref => (this.xAxisRef = ref)}
              transform={`translate(0, ${HEIGHT - MARGIN.bottom})`}
            />
            <g ref={ref => (this.yAxisRef = ref)} transform={`translate(${MARGIN.left}, 0)`} />
            <g ref={ref => (this.legendRef = ref)} transform={`translate(100, 50)`} />
          </svg>
        </div>
      </div>
    );
  }

  static getDerivedStateFromProps(props) {
    const { labourData, unemploymentData } = props;

    const allData = labourData.concat(unemploymentData);

    const dateScale = d3
      .scaleLinear()
      .domain(d3.extent(allData, d => d.key))
      .range([MARGIN.left, WIDTH - MARGIN.right]);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(allData, d => d.value))
      .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

    const mapLineData = d3
      .line()
      .x(d => dateScale(d.key))
      .y(d => yScale(d.value));

    return {
      dateScale,
      yScale,
      labourLineData: mapLineData(labourData),
      unemploymentLineData: mapLineData(unemploymentData)
    };
  }

  state = {
    labourLineData: '',
    unemploymentLineData: '',
    dateScale: noop,
    yScale: noop
  };

  xAxis = d3.axisBottom().tickFormat(d3.format('d'));
  yAxis = d3.axisLeft().tickFormat(d3.format('.2s'));

  refreshScale = () => {
    this.xAxis.scale(this.state.dateScale);
    d3.select(this.xAxisRef).call(this.xAxis);

    this.yAxis.scale(this.state.yScale);
    d3.select(this.yAxisRef).call(this.yAxis);
  };

  componentDidMount() {
    this.refreshScale();
    d3.select(this.legendRef).call(legendOrdinal);
  }

  componentDidUpdate() {
    this.refreshScale();
  }
}
