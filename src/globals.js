import * as d3 from "d3";
import { updateScatterPlot } from "./scatterplot";
import { updateParallel } from "./parallel";


export function updateCharts(key) {
  console.log("updateCharts:" + key);
  updateScatterPlot(key[0], key[1]);
  updateParallel(key[0], key[1]);
}


export const mapColorScheme = d3
  .scaleThreshold()
  .domain([70, 74, 78, 82])
  .range(["#FF5733", "#F27E23", "#FFC300", "#6EC644"])
  .unknown("#FFFFFF"); 