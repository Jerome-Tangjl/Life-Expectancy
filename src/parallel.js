import * as d3 from "d3";
import { isEmpty, debounce } from "lodash";

const margin = { left: 40, right: 20, top: 50, bottom: 60 };
let size = { width: 0, height: 0 };
// let region_name = "Sub-Saharan Africa";
// let this_region_color = "#FF5733";
let region_name1 = "Sub-Saharan Africa";
let this_region_color1 = "#FF5733";
let region_name2 = "North America";
let this_region_color2 = "#6EC644";

// function getData(data) {

//   const filteredData = data.filter(d => d.region === region_name1 && d.Sanitation !== "" && d.prevelance_of_undernourishment !== "" && d.health_expenditure !== "");


//   const aggregatedData = filteredData.map(d => ({
//     country_name: d.country_name,
//     life_expectancy: parseFloat(d.life_expectancy).toFixed(2),
//     health_expenditure: parseFloat(d.health_expenditure).toFixed(2),
//     Sanitation: parseFloat(d.Sanitation).toFixed(2),
//     undernourishment_rate: parseFloat(d.prevelance_of_undernourishment).toFixed(2)
//   }));

//   return aggregatedData;

// }

function getDataByRegion(data, regionName) {
 
  const filteredData = data.filter(d => d.region === regionName && d.Sanitation !== "" && d.prevelance_of_undernourishment !== "" && d.health_expenditure !== "");
  const aggregatedData = filteredData.map(d => ({
    country_name: d.country_name,
    life_expectancy: parseFloat(d.life_expectancy).toFixed(2),
    health_expenditure: parseFloat(d.health_expenditure).toFixed(2),
    Sanitation: parseFloat(d.Sanitation).toFixed(2),
    undernourishment_rate: parseFloat(d.prevelance_of_undernourishment).toFixed(2)
  }));

  return aggregatedData;

}

let ParallelData;
let rawData;

let ParallelData1;
let ParallelData2;

await d3
  .csv(
    "../data/life_expectancy_2019.csv"
  )
  .then(function (data) {
    rawData = data;
  });

const onResize = (targets) => {
  targets.forEach((target) => {
    if (target.target.getAttribute("id") !== "parallel-container") return;
    size = {
      width: target.contentRect.width,
      height: target.contentRect.height,
    };
    if (!isEmpty(size) && !isEmpty(rawData)) {
      d3.select("#parallel-svg").selectAll("*").remove();
      initChart();
    }
  });
};

const chartObserver = new ResizeObserver(debounce(onResize, 100));
//   <h6>Distribution of Jobs across companies and experience levels</h6>
export const Parallel = () =>
  `<div class='chart-container-3 d-flex flex-column' id='parallel-container'>
    
      <svg id='parallel-svg' width='100%' height='100%'>
      </svg>
  </div>`;

export function mountParallel() {
  let ParallelContainer = document.querySelector("#parallel-container");
  chartObserver.observe(ParallelContainer);
}

function initChart() {

  // ParallelData = getData(rawData);
  // console.log("parallel", ParallelData);

  ParallelData1 = getDataByRegion(rawData, region_name1);
  ParallelData2 = getDataByRegion(rawData, region_name2);


  // append the svg object to the body of the page
  const svg = d3.select("#parallel-svg")
    .append("svg")
    .attr("width", size.width + margin.left + margin.right)
    .attr("height", size.height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      `translate(0,${margin.top})`);

  svg
    .append("text")
    .attr("x", 350)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text(`Life expectancy correlation`);


  // Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
  const dimensions = Object.keys(ParallelData1[0]).filter(key => key !== "country_name");
  console.log("dimensions", dimensions);

  // For each dimension, I build a linear scale. I store all in a y object
  const y = {}
  // for (let i in dimensions) {
  //   let name = dimensions[i]
  //   y[name] = d3.scaleLinear()
  //     .domain(d3.extent(ParallelData, function (d) { return +d[name]; }))
  //     .range([340, 0])
  // }
  y.life_expectancy = d3.scaleLinear()
    .domain([50, 85]) 
    .range([340, 0]);

  y.health_expenditure = d3.scaleLinear()
    .domain([0, 18]) 
    .range([340, 0]);

  y.Sanitation = d3.scaleLinear()
    .domain([0, 100]) 
    .range([340, 0]);

  y.undernourishment_rate = d3.scaleLinear()
    .domain([0, 50]) 
    .range([340, 0]);

  // Build the X scale -> it find the best position for each Y axis
  const x = d3.scalePoint()
    .range([0, 700])
    .padding(1)
    .domain(dimensions);

  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
    return d3.line()(dimensions.map(function (p) { return [x(p), y[p](d[p])]; }));
  }


  // create a tooltip
  const Tooltip = d3.select("#parallel-container")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "3px")
    .style("position", "absolute")

  // Draw the lines
  svg
    .selectAll("myPath1")
    .data(ParallelData1)
    .join("path")
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", this_region_color1)
    .style("stroke-width", 4)
    .style("opacity", 0.5)

    .on("mouseover", (event, d) => {
      Tooltip.style("opacity", 1)
        .html(`
      Country: ${d.country_name}<br>
      Life Expectancy: ${d.life_expectancy}<br>
      Health Expenditure: ${d.health_expenditure}%<br>
      Sanitation: ${d.Sanitation}%<br>
      Prevelance of Undernourishment: ${d.prevelance_of_undernourishment}%
    `);
      ;
    })
    .on("mousemove", (event) => {
      Tooltip
        .style("top", (event.pageY - 10) + "px")
        .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseleave", () => {
      Tooltip.style("opacity", 0);
    });

     // Draw the lines
  svg
  .selectAll("myPath2")
  .data(ParallelData2)
  .join("path")
  .attr("d", path)
  .style("fill", "none")
  .style("stroke", this_region_color2)
  .style("stroke-width", 4)
  .style("opacity", 0.5)

  .on("mouseover", (event, d) => {
    Tooltip.style("opacity", 1)
      .html(`
    Country: ${d.country_name}<br>
    Life Expectancy: ${d.life_expectancy}<br>
    Health Expenditure: ${d.health_expenditure}%<br>
    Sanitation: ${d.Sanitation}%<br>
    Prevelance of Undernourishment: ${d.prevelance_of_undernourishment}%
  `);
    ;
  })
  .on("mousemove", (event) => {
    Tooltip
      .style("top", (event.pageY - 10) + "px")
      .style("left", (event.pageX + 10) + "px");
  })
  .on("mouseleave", () => {
    Tooltip.style("opacity", 0);
  });

  // Draw the axis:
  svg.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    // I translate this element to its right position on the x axis
    .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
    // And I build the axis with the call function
    .each(function (d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
    // Add axis title
    .append("text")
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .attr("y", -8)
    .text(function (d) { return d; })
    .style("fill", "black")

    

}

export function updateParallel(region, region_color) {
  region_name1 = region;
  this_region_color = region_color;
  d3.select("#parallel-svg").selectAll("*").remove();
  initChart();
}