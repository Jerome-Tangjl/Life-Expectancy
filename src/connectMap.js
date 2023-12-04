import * as d3 from "d3";
import { isEmpty, debounce } from "lodash";
import { legendColor, legendHelpers } from "d3-svg-legend";
import { updateCharts, mapColorScheme } from "./globals";

const margin = { left: 40, right: 20, top: 50, bottom: 60 };
let size = { width: 0, height: 0 };
let country_name = "US";

function getMapData(orig_data) {
  // Calculate average life expectancy by region
  const regionAvgLifeExpectancy = d3.rollup(
    orig_data,
    (values) => d3.mean(values, (d) => +d.life_expectancy),
    (d) => d.region
  );

  // Map country data and add region details
  const mapData = orig_data.map((d) => ({
    country: d.country_name,
    life_expectancy: +d.life_expectancy,
    region: d.region,
    avgLifeExpectancy: regionAvgLifeExpectancy.get(d.region), // Add the region's average life expectancy
    // Add other fields if needed
  }));

  return mapData;
}

// Variable that hold the data
let dataGeo;
let data;

// Load world shape AND list of connection
await Promise.all([
  d3.json(
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
  ), // World shape
  d3.csv(
    "../data/life_expectancy_2019.csv"
  ), // Position of circles
]).then(function (initialize) {
  dataGeo = initialize[0];
  data = getMapData(initialize[1]);
  console.log("dataGeo", dataGeo);
  console.log("data", data);
});

const onResize = (targets) => {
  targets.forEach((target) => {
    if (target.target.getAttribute("id") !== "map-container") return;
    size = {
      width: target.contentRect.width,
      height: target.contentRect.height,
    };
    if (!isEmpty(size) && !isEmpty(data)) {
      d3.select("#map-svg").selectAll("*").remove();
      //console.log(size, bars)
      initChart();
    }
  });
};
const chartObserver = new ResizeObserver(debounce(onResize, 100));

export const ConnectMap = () =>
  // equivalent to <template> in Vue
  `<div class='chart-container-1 flex-column' id='map-container'>
    <p style="font-weight:bold;text-decoration: none;">Life expectancy around the world in 2019</p>
        <svg id='map-svg' width='100%' height='80%'>
        </svg>
    </div>`;

export function mountConnectMap() {
  // registering this element to watch its size change
  let mapContainer = document.querySelector("#map-container");
  chartObserver.observe(mapContainer);
}

function initChart() {
  // ConnectMap and projection
  const projection = d3
    .geoMercator()
    .scale(size.width / (2 * Math.PI))
    .translate([size.width / 2, size.height / 2])
    .center([0, 45]);

  // A path generator
  const pathBuilder = d3.geoPath(projection); // d3.geoPath.projection(projection);


  const colorScale = mapColorScheme;

  // Define tooltip
  const Tooltip = d3
    .select("#map-container")
    .append("div")
    .attr("class", "map-tooltip")
    .style("visibility", "hidden")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute")
    .on("mouseover", (event) => {
      // A bug where if the user's cursor gets on top of the Tooltip, it flashes infinitely until the user's cursor moves
      // Very distracting and this gets rid of it completely. Besides, the cursor should never be over the Tooltip anyway
      Tooltip.style("visibility", "hidden");
    });

  // Define map zoom
  const zoom = d3
    .zoom()
    .on("zoom", (event) => {
      map.attr("transform", event.transform);
    })
    .scaleExtent([1, 70]);

  const minDataValue = d3.min(data, (d) => d.total_amount);
  const maxDataValue = d3.max(data, (d) => d.total_amount);
  const range = maxDataValue - minDataValue;
  const minPathThickness = 1; // Min Path Thickness
  const maxPathThickness = 1000; // Max Path Thickness

  // Defining the scale for path thickness
  const pathThicknessScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([minPathThickness, maxPathThickness]);

  // The SVG
  const map = d3
    .select("#map-svg")
    .attr("padding", "none")
    .attr("height", size.height - 40)
    .attr("width", size.width)
    .attr("border", "1px solid black")
    // .attr("margin-left", "10px")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .call(zoom)
    .append("g");

  // Draw the map
  map
    // .append("g")
    .selectAll("path")
    .data(dataGeo.features)
    .enter()
    .append("path")
    .classed("country", true)
    .attr("id", (feature) => {
      return "country_" + feature.properties.name;
    })
    .attr("fill", (feature) => {
      const value = data.find(
        (item) => item.country === feature.properties.name
      );
      // console.log(value);
      if (value) {
        // console.log(feature.properties);
        feature.properties.region = value.region;
        feature.properties.exp = value.avgLifeExpectancy;
        return colorScale(feature.properties.exp);
      } else {
        feature.properties.region = null;
        return colorScale(feature.properties.region);
      }
    })
    .attr("d", (feature) => {
      return pathBuilder(feature);
    })
    .attr("opacity", ".7")
    .attr("stroke", "black")
    .attr("stroke-width", ".5px")
    .on("mouseover", (event, feature) => {
      d3.select("#country_" + feature.properties.name)
        .transition()
        .duration(200)
        .attr("opacity", "1")
        .attr("stroke-width", "1px")
        .style("cursor", "pointer");

      Tooltip.style("visibility", "visible");
    })
    .on("mouseleave", (event, feature) => {
      d3.selectAll(".country")
        .transition()
        .duration(200)
        .attr("opacity", "0.7")
        .attr("stroke-width", ".5px");

      Tooltip.style("visibility", "hidden");
    })
    .on("mousemove", (event, feature) => {
      const country = data.find(
        (agg) => agg.country === feature.properties.name
      );
      if (country) {
        Tooltip.html(
          feature.properties.name +
          "<br>" +
          "Life Expectancy:" +
          country.life_expectancy.toFixed(2) +
          "<br>" +
          "Region:" +
          country.region +
          "<br>" +
          "Region Average Life Expectancy:" +
          country.avgLifeExpectancy.toFixed(2)

        )
          .style("left", event.x + 10 + "px")
          .style("top", event.y + 10 + "px");
      } else {
        Tooltip.html(feature.properties.name + "<br>" + "Life Expectancy:N/A")
          .style("left", event.x + 10 + "px")
          .style("top", event.y + 10 + "px");
      }
    })
    .on("click", (event, feature) => {
      if (feature.properties.name != country_name) {
        country_name = feature.properties.name;
        if (feature.properties.region != null) {
          updateCharts([feature.properties.region, colorScale(feature.properties.exp)]);
        }
      }

    });

  map
    .append("g")
    .attr("class", "legendThreshold")
    .attr("transform", `translate(${size.width * 0.04},${size.height * 0.65})`);

  const legendThresholds = [70, 74, 78, 82];

  const legend = legendColor()
    .labelFormat(d3.format(",.0s"))
    .labels(legendThresholds.map((d, i) => i === 0 ? `< ${d}` : `${legendThresholds[i - 1]} - ${d}`))
    .labelOffset(3)
    .shapePadding(0)
    .scale(colorScale);

  map.select(".legendThreshold").call(legend);

  let color_neg = false;

}
