import React from "react";
import * as d3 from "d3";

const WIDTH = 800;
const HEIGHT = 500;
const MARGIN = {
  top: 40,
  left: 20,
  right: 20,
  bottom: 40
};

export class LineGraph extends React.Component {
  state = {
    lineData: ""
  };

  componentDidMount() {
    this.refreshData();
  }

  refreshData = () => {
    const { inputData } = this.props;

    const dateScale = d3
      .scaleLinear()
      .domain(d3.extent(inputData, d => d.key))
      .range([MARGIN.left, WIDTH - MARGIN.right]);
    const labourScale = d3
      .scaleLinear()
      .domain(d3.extent(inputData, d => d.value))
      .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

    const mapLineData = d3
      .line()
      .x(d => dateScale(d.key))
      .y(d => labourScale(d.value));

    this.setState({ lineData: mapLineData(inputData) });
  };

  render() {
    return (
      <div>
        <svg width={WIDTH} height={HEIGHT}>
          <path
            d={this.state.lineData}
            fill="none"
            strokeWidth={1.5}
            stroke="purple"
          />
        </svg>
      </div>
    );
  }
}
