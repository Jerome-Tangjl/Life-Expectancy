import * as d3 from "d3";
import { updateScatterPlot } from "./scatterplot";
import { updateParallel } from "./parallel";


export function updateCharts(key) {
  console.log("updateCharts:" + key);
  updateScatterPlot(key[0], key[1]);
  updateParallel(key[0], key[1]);
}
