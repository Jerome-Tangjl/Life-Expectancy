// import { mountBarChart, BarChart } from './src/example';
import { mountConnectMap, ConnectMap } from './src/connectMap';
import { mountScatterPlot, ScatterPlot } from "./src/scatterplot";
import { mountParallel, Parallel } from "./src/parallel";
import './style.css';

// You can manage your layout through CSS, or this template also has materialize library supported.
// Materialize: https://materializecss.com/getting-started.html

document.querySelector('#app').innerHTML = `
  <div id='main-container' class='d-flex flex-row flex-nowrap'>
  <div id='left-container' class='d-flex flex-column flex-nowrap'>
  ${ConnectMap()}
  </div>
  <div id='right-container' class='d-flex flex-column flex-nowrap'>
  ${Parallel()}
  ${ScatterPlot()}
  </div>
  </div>
`


mountConnectMap();
mountParallel();
mountScatterPlot();
