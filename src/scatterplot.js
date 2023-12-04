import * as d3 from "d3";
import { isEmpty, debounce } from "lodash";

const margin = { left: 40, right: 20, top: 50, bottom: 60 };
let size = { width: 0, height: 0 };
let region_name = "Sub-Saharan Africa";
let this_region_color="#FF5733";

function getData(data) {

  // 使用 D3 的数据处理功能
  const filteredData = data.filter(d => d.region === region_name);

  const processedData = d3.groups(filteredData, d => d.Year);

  const aggregatedData = processedData.map(([year, yearData]) => ({
    year: year,
    avgLifeExpectancy: d3.mean(yearData, d => d.life_expectancy)
  }));

  return aggregatedData;

}

let ScatterData;
let rawData;
await d3
  .csv(
    "../data/life_expectancy.csv"
  )
  .then(function (data) {
    rawData = data;
  });

const onResize = (targets) => {
  targets.forEach((target) => {
    if (target.target.getAttribute("id") !== "scatter-container") return;
    size = {
      width: target.contentRect.width,
      height: target.contentRect.height,
    };
    if (!isEmpty(size) && !isEmpty(rawData)) {
      d3.select("#scatter-svg").selectAll("*").remove();
      initChart();
    }
  });
};

const chartObserver = new ResizeObserver(debounce(onResize, 100));
//   <h6>Distribution of Jobs across companies and experience levels</h6>
export const ScatterPlot = () =>
  `<div class='chart-container-3 d-flex flex-column' id='scatter-container'>
    
      <svg id='scatter-svg' width='100%' height='100%'>
      </svg>
  </div>`;

export function mountScatterPlot() {
  let ScatterContainer = document.querySelector("#scatter-container");
  chartObserver.observe(ScatterContainer);
}

function initChart() {

  ScatterData = getData(rawData);
  console.log("scatter", ScatterData);

  // append the svg object to the body of the page
  const svg = d3.select("#scatter-svg")
    .append("svg")
    .attr("width", size.width + margin.left + margin.right)
    .attr("height", size.height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

    svg
    .append("text")
    .attr("x", 290)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text(`Average life expectancy from 2001 to 2019 in ${region_name}`);


  // Add X axis
  const x = d3.scaleLinear()
    .domain(d3.extent(ScatterData, d => d.year))
    .range([0, 550]);//size.width
  svg.append("g")
    .attr("transform", `translate(0, 250)`)
    .call(d3.axisBottom(x));

  svg
    .append("text")
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .attr("x", 550 * 0.5)
    .attr("y", 235 + margin.top - 5)
    .text("Year");

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([50, 85])
    .range([250, 0]);//size.height
  svg.append("g")
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 10)
    .attr("x", -margin.top)
    .text("Avg Life Expectancy")


  // Add the line
  svg.append("path")
    .datum(ScatterData)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .curve(d3.curveBasis) // Just add that to have a curve instead of segments
      .x(d => x(d.year))
      .y(d => y(d.avgLifeExpectancy))
    )

  // create a tooltip
  const Tooltip = d3.select("#scatter-container")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "3px")
    .style("position", "absolute")

  // Three function that change the tooltip when user hover / move / leave a cell
  const mouseover = function (event, d) {
    Tooltip
      .style("opacity", 1)
  }
  const mousemove = function (event, d) {
    Tooltip
      .html(d.year+"：" + d.avgLifeExpectancy.toFixed(2))
      .style("left", `${event.offsetX + 700}px`)
      .style("top", `${event.offsetY + 350}px`)
      // .style("left", event.x + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      // .style("top", event.y / 2 + "px");
      
  }
  const mouseleave = function (event, d) {
    Tooltip
      .style("opacity", 0)
  }



  // Add the points
  svg
    .append("g")
    .selectAll("dot")
    .data(ScatterData)
    .join("circle")
    .attr("class", "myCircle")
    .attr("cx", d => x(d.year))
    .attr("cy", d => y(d.avgLifeExpectancy))
    .attr("r", 8)
    .attr("stroke", this_region_color)
    .attr("stroke-width", 3)
    .attr("fill", "white")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)


}

export function updateScatterPlot(region, region_color) {
  region_name = region;
  this_region_color=region_color;
  d3.select("#scatter-svg").selectAll("*").remove();
  console.log(region,region_color);
  initChart();
}