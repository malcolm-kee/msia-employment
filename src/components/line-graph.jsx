import React from 'react';
import * as d3 from 'd3';
import { legendColor } from 'd3-svg-legend';
import { lastItem } from '../util/array-util';
import { noop } from '../util/fn-util';
import './line-graph.css';

const WIDTH = 800;
const HEIGHT = 200;
const MARGIN = {
  top: 0,
  left: 40,
  right: 0,
  bottom: 40
};

const ordinal = d3
  .scaleOrdinal()
  .domain(['Outside Labour', 'Unemployment'])
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

/**
 * @param {Array} data
 * @param {Array<number>} range
 */
const partitionData = (data, range) => {
  if (range.length !== 2) {
    return {
      inRange: data,
      before: [],
      after: []
    };
  }

  const partitionedData = data.reduce(
    (result, d) => ({
      ...result,
      ...(d.key < range[0]
        ? { before: result.before.concat(d) }
        : d.key > range[1]
          ? { after: result.after.concat(d) }
          : { inRange: result.inRange.concat(d) })
    }),
    {
      inRange: [],
      before: [],
      after: []
    }
  );

  // place first point in range to before so that the line will be connected
  if (partitionedData.before.length > 0) {
    partitionedData.before = partitionedData.before.concat(partitionedData.inRange[0]);
  }

  // insert last point in range to after so that the line will be connected
  if (partitionedData.after.length > 0) {
    partitionedData.after = [lastItem(partitionedData.inRange)].concat(partitionedData.after);
  }

  return partitionedData;
};

export class LineGraph extends React.Component {
  render() {
    const props = this.props;
    return (
      <section className="line-graph">
        <h2 className="line-graph--title">
          {props.title} ({this.state.minYear}-{this.state.maxYear})
        </h2>
        <div className="line-graph--chart-container">
          <svg
            className="line-graph--chart"
            width={WIDTH}
            height={HEIGHT}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          >
            <path d={this.state.labourLine} fill="none" strokeWidth={1.5} stroke="purple" />
            <path d={this.state.unemploymentLine} fill="none" strokeWidth={1.5} stroke="blue" />
            <path
              d={this.state.labourLineBeforeRange}
              fill="none"
              strokeWidth={1.5}
              stroke="grey"
            />
            <path
              d={this.state.unemploymentLineBeforeRange}
              fill="none"
              strokeWidth={1.5}
              stroke="grey"
            />
            <path d={this.state.labourLineAfterRange} fill="none" strokeWidth={1.5} stroke="grey" />
            <path
              d={this.state.unemploymentLineAfterRange}
              fill="none"
              strokeWidth={1.5}
              stroke="grey"
            />
            <g
              ref={ref => (this.xAxisRef = ref)}
              transform={`translate(0, ${HEIGHT - MARGIN.bottom})`}
            />
            <g ref={ref => (this.yAxisRef = ref)} transform={`translate(${MARGIN.left}, 0)`} />
            <g ref={ref => (this.legendRef = ref)} transform={`translate(75, 20)`} />
            <g ref={ref => (this.brushRef = ref)} />
          </svg>
        </div>
      </section>
    );
  }

  static getDerivedStateFromProps(props) {
    const { labourData, unemploymentData, range } = props;

    const allData = labourData.concat(unemploymentData);
    const dateExtent = d3.extent(allData, d => d.key);
    const labourDataPartition = partitionData(labourData, range);
    const unemploymentDataPartition = partitionData(unemploymentData, range);

    const dateScale = d3
      .scaleLinear()
      .domain(dateExtent)
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
      labourLine: mapLineData(labourDataPartition.inRange),
      labourLineBeforeRange: mapLineData(labourDataPartition.before),
      labourLineAfterRange: mapLineData(labourDataPartition.after),
      unemploymentLine: mapLineData(unemploymentDataPartition.inRange),
      unemploymentLineBeforeRange: mapLineData(unemploymentDataPartition.before),
      unemploymentLineAfterRange: mapLineData(unemploymentDataPartition.after),
      minYear: dateExtent[0],
      maxYear: dateExtent[1]
    };
  }

  state = {
    labourLine: '',
    unemploymentLine: '',
    labourLineBeforeRange: '',
    unemploymentLineBeforeRange: '',
    labourLineAfterRange: '',
    unemploymentLineAfterRange: '',
    minYear: '',
    maxYear: '',
    dateScale: noop,
    yScale: noop
  };

  xAxis = d3.axisBottom().tickFormat(d3.format('d'));
  yAxis = d3
    .axisLeft()
    .ticks(5)
    .tickFormat(d3.format('.2s'));

  refreshScale = () => {
    this.xAxis.scale(this.state.dateScale);
    d3.select(this.xAxisRef).call(this.xAxis);

    this.yAxis.scale(this.state.yScale);
    d3.select(this.yAxisRef).call(this.yAxis);
  };

  componentDidMount() {
    this.refreshScale();
    d3.select(this.legendRef).call(legendOrdinal);
    this.brush = d3
      .brushX()
      .extent([[MARGIN.left, MARGIN.top], [WIDTH - MARGIN.right, HEIGHT - MARGIN.bottom]])
      .on('end', () => {
        const [minX, maxX] = d3.event.selection;
        const range = [this.state.dateScale.invert(minX), this.state.dateScale.invert(maxX)];

        this.props.setRange(range);
      });

    d3.select(this.brushRef).call(this.brush);
  }

  componentDidUpdate() {
    this.refreshScale();
  }
}
