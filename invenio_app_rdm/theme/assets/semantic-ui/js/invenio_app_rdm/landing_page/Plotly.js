import React, { Component } from "react";
import Plot from 'react-plotly.js';
import axios from "axios";


export class Plotly extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dt: [],
      v: []
    };
  }

  componentDidMount() {
    const { chartresource } = this.props;

    axios({
      url: chartresource.chart_url,
      method: 'get',
      params: chartresource.chart_props
    })
    .then(response => {
      const datas = response.data;
      this.setState({
        dt: datas.data.Datetime.map(x => x * 1000),
        v: datas.data.Value
       });
    })
    .catch(function (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request`
         console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
         console.log('Error', error.message);
      }
      console.log(error.config);
    })
    .then(function () {
      // always executed
    });
  }

  render() {
    return (
      <Plot
        data={[
          {
            x: this.state.dt,
            y: this.state.v,
            type: 'scatter',
            mode: 'lines',
            line: {color: '#bd0a27'},
          },
        ]}
        layout={{
          autosize: true,
          title: 'Time Series',
          xaxis: {
            autorange: true,
            type: 'date',
          },
          yaxis: {
            autorange: true,
            type: 'linear'
          }
        }}
        useResizeHandler={true}
        style={{width: '100%', height: '100%'}}
      />
    );
  }
};
