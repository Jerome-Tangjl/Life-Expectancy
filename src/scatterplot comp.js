import * as d3 from "d3";
import { isEmpty, debounce } from "lodash";

const margin = { left: 40, right: 20, top: 50, bottom: 60 };
let size = { width: 0, height: 0 };
// let region_name = "Sub-Saharan Africa";
// let this_region_color="#FF5733";
let region_name1 = "Sub-Saharan Africa";
let this_region_color1 = "#FF5733";
let region_name2 = "North America";
let this_region_color2 = "#6EC644";
let region_name3 = "South Asia";
let this_region_color3 = "#F27E23";
let region_name4 = "East Asia & Pacific";
let this_region_color4 = "#FFC300";
let region_name5 = "Latin America & Caribbean";
let this_region_color5 = "#F2D323";
let region_name6 = "Middle East & North Africa";
let this_region_color6 = "#F2EE23";
let region_name7 = "Europe & Central Asia";
let this_region_color7 = "#DAF7A6";

function getData(data) {

  // 使用 D3 的数据处理功能
  const filteredData = data.filter(d => d.region === region_name1);

  const processedData = d3.groups(filteredData, d => d.Year);

  const aggregatedData = processedData.map(([year, yearData]) => ({
    year: year,
    avgLifeExpectancy: d3.mean(yearData, d => d.life_expectancy)
  }));

  return aggregatedData;

}

function getDataForRegion(data, regionName) {
  const filteredData = data.filter(d => d.region === regionName);
  const processedData = d3.groups(filteredData, d => d.Year);
  return processedData.map(([year, yearData]) => ({
    year: year,
    avgLifeExpectancy: d3.mean(yearData, d => d.life_expectancy)
  }));
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
  `<div class='chart-container-2 d-flex flex-column' id='scatter-container'>
    
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

  const ScatterData1 = getDataForRegion(rawData, region_name1);
  const ScatterData2 = getDataForRegion(rawData, region_name2);
  const ScatterData3 = getDataForRegion(rawData, region_name3);
  const ScatterData4 = getDataForRegion(rawData, region_name4);
  const ScatterData5 = getDataForRegion(rawData, region_name5);
  const ScatterData6 = getDataForRegion(rawData, region_name6);
  const ScatterData7 = getDataForRegion(rawData, region_name7);

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
    .text(`Average life expectancy from 2001 to 2019`);


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


  // // Add the line
  // svg.append("path")
  //   .datum(ScatterData)
  //   .attr("fill", "none")
  //   .attr("stroke", "black")
  //   .attr("stroke-width", 1.5)
  //   .attr("d", d3.line()
  //     .curve(d3.curveBasis) // Just add that to have a curve instead of segments
  //     .x(d => x(d.year))
  //     .y(d => y(d.avgLifeExpectancy))
  //   )

  svg.append("path")
    .datum(ScatterData1)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .curve(d3.curveBasis)
      .x(d => x(d.year))
      .y(d => y(d.avgLifeExpectancy))
    );

  // 绘制第二条线条
  svg.append("path")
    .datum(ScatterData2)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .curve(d3.curveBasis)
      .x(d => x(d.year))
      .y(d => y(d.avgLifeExpectancy))
    );

    svg.append("path")
    .datum(ScatterData3)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .curve(d3.curveBasis)
      .x(d => x(d.year))
      .y(d => y(d.avgLifeExpectancy))
    );

    svg.append("path")
    .datum(ScatterData4)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .curve(d3.curveBasis)
      .x(d => x(d.year))
      .y(d => y(d.avgLifeExpectancy))
    );

    svg.append("path")
    .datum(ScatterData5)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .curve(d3.curveBasis)
      .x(d => x(d.year))
      .y(d => y(d.avgLifeExpectancy))
    );

    svg.append("path")
    .datum(ScatterData6)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .curve(d3.curveBasis)
      .x(d => x(d.year))
      .y(d => y(d.avgLifeExpectancy))
    );

    svg.append("path")
    .datum(ScatterData7)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .curve(d3.curveBasis)
      .x(d => x(d.year))
      .y(d => y(d.avgLifeExpectancy))
    );




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
      .html(d.year + "：" + d.avgLifeExpectancy.toFixed(2))
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
    .data(ScatterData1)
    .join("circle")
    .attr("class", "myCircle")
    .attr("cx", d => x(d.year))
    .attr("cy", d => y(d.avgLifeExpectancy))
    .attr("r", 8)
    .attr("stroke", this_region_color1)
    .attr("stroke-width", 3)
    .attr("fill", "white")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

  // Add the points
  svg
    .append("g")
    .selectAll("dot")
    .data(ScatterData2)
    .join("circle")
    .attr("class", "myCircle")
    .attr("cx", d => x(d.year))
    .attr("cy", d => y(d.avgLifeExpectancy))
    .attr("r", 8)
    .attr("stroke", this_region_color2)
    .attr("stroke-width", 3)
    .attr("fill", "white")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)


    svg
    .append("g")
    .selectAll("dot")
    .data(ScatterData3)
    .join("circle")
    .attr("class", "myCircle")
    .attr("cx", d => x(d.year))
    .attr("cy", d => y(d.avgLifeExpectancy))
    .attr("r", 8)
    .attr("stroke", this_region_color3)
    .attr("stroke-width", 3)
    .attr("fill", "white")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

    svg
    .append("g")
    .selectAll("dot")
    .data(ScatterData4)
    .join("circle")
    .attr("class", "myCircle")
    .attr("cx", d => x(d.year))
    .attr("cy", d => y(d.avgLifeExpectancy))
    .attr("r", 8)
    .attr("stroke", this_region_color4)
    .attr("stroke-width", 3)
    .attr("fill", "white")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

    svg
    .append("g")
    .selectAll("dot")
    .data(ScatterData5)
    .join("circle")
    .attr("class", "myCircle")
    .attr("cx", d => x(d.year))
    .attr("cy", d => y(d.avgLifeExpectancy))
    .attr("r", 8)
    .attr("stroke", this_region_color5)
    .attr("stroke-width", 3)
    .attr("fill", "white")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

    svg
    .append("g")
    .selectAll("dot")
    .data(ScatterData6)
    .join("circle")
    .attr("class", "myCircle")
    .attr("cx", d => x(d.year))
    .attr("cy", d => y(d.avgLifeExpectancy))
    .attr("r", 8)
    .attr("stroke", this_region_color6)
    .attr("stroke-width", 3)
    .attr("fill", "white")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

    svg
    .append("g")
    .selectAll("dot")
    .data(ScatterData7)
    .join("circle")
    .attr("class", "myCircle")
    .attr("cx", d => x(d.year))
    .attr("cy", d => y(d.avgLifeExpectancy))
    .attr("r", 8)
    .attr("stroke", this_region_color7)
    .attr("stroke-width", 3)
    .attr("fill", "white")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)



  const legend = svg.append("g")
    .attr("transform", `translate(-50, ${margin.top})`);

  legend.append("rect")
    .attr("x", size.width - 250)
    .attr("y", 0)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", this_region_color2);

  legend.append("text")
    .attr("x", size.width - 220)
    .attr("y", 15)
    .text(region_name2);


  legend.append("rect")
    .attr("x", size.width - 250)
    .attr("y", 25)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", this_region_color7);

  legend.append("text")
    .attr("x", size.width - 220)
    .attr("y", 40)
    .text(region_name7);


    legend.append("rect")
    .attr("x", size.width - 250)
    .attr("y", 50)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", this_region_color6);

  legend.append("text")
    .attr("x", size.width - 220)
    .attr("y", 65)
    .text(region_name6);


    legend.append("rect")
    .attr("x", size.width - 250)
    .attr("y", 75)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", this_region_color5);

  legend.append("text")
    .attr("x", size.width - 220)
    .attr("y", 90)
    .text(region_name5);


    legend.append("rect")
    .attr("x", size.width - 250)
    .attr("y", 100)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", this_region_color4);

  legend.append("text")
    .attr("x", size.width - 220)
    .attr("y", 115)
    .text(region_name4);



    legend.append("rect")
    .attr("x", size.width - 250)
    .attr("y", 125)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", this_region_color3);

  legend.append("text")
    .attr("x", size.width - 220)
    .attr("y", 140)
    .text(region_name3);
    

  legend.append("rect")
    .attr("x", size.width - 250)
    .attr("y", 150)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", this_region_color1);

  legend.append("text")
    .attr("x", size.width - 220)
    .attr("y", 165)
    .text(region_name1);



}


export function updateScatterPlot(region, region_color) {
  region_name1 = region;
  this_region_color1 = region_color;
  d3.select("#scatter-svg").selectAll("*").remove();
  console.log(region, region_color);
  initChart();
}