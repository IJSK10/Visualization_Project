"use client"
import { useEffect, useRef } from "react";
import * as d3 from "d3";

const PCPPlot = ({ data, order, setOrder }) => {
  const svgRef = useRef(null);
  //const k = 4; // Default value as instructed
 // Changed dependency to queryParameter

  // Function to move a dimension left in the order array
  const moveAxisLeft = (dimension) => {
    const currentIndex = order.indexOf(dimension);
    if (currentIndex <= 0) return; // Can't move left if already leftmost
    
    const newOrder = [...order];
    // Swap with the dimension to the left
    [newOrder[currentIndex], newOrder[currentIndex - 1]] = 
    [newOrder[currentIndex - 1], newOrder[currentIndex]];
    
    setOrder(newOrder);
  };

  // Function to move a dimension right in the order array
  const moveAxisRight = (dimension) => {
    const currentIndex = order.indexOf(dimension);
    if (currentIndex >= order.length - 1) return; // Can't move right if already rightmost
    
    const newOrder = [...order];
    // Swap with the dimension to the right
    [newOrder[currentIndex], newOrder[currentIndex + 1]] = 
    [newOrder[currentIndex + 1], newOrder[currentIndex]];
    
    setOrder(newOrder);
  };

  useEffect(() => {
    if (data.length === 0 || !order) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 80, right: 30, bottom: 100, left: 10 },
      width = 1450 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    const dimensions = [...order];

    const x = d3.scalePoint().domain(dimensions).range([0, width]).padding(1.5);
    const y = {};

    dimensions.forEach((dim) => {
      if (typeof data[0][dim] === "number") {
        y[dim] = d3
          .scaleLinear()
          .domain(d3.extent(data, (d) => +d[dim]))
          .range([height, 0]);
      } else {
        y[dim] = d3
          .scalePoint()
          .domain([...new Set(data.map((d) => d[dim]))])
          .range([height, 0]);
      }
    });

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const line = d3.line().x((d) => x(d.dimension)).y((d) => y[d.dimension](d.value));

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .text("PCP Plot");

    g.selectAll(".line")
      .data(data)
      .enter()
      .append("path")
      .attr("d", (d) =>
        line(
          dimensions.map((dim) => ({ dimension: dim, value: d[dim] }))
        )
      )
      .style("fill", "none")
      .style("stroke", (d) => color(d.bin_id))
      .style("opacity", 0.7);

    const axisGroups = g.selectAll(".axis")
      .data(dimensions)
      .enter()
      .append("g")
      .attr("class", "axis")
      .attr("transform", (d) => `translate(${x(d)},0)`)
      .each(function (d) {
        const axisGroup = d3.select(this);

        axisGroup.call(d3.axisLeft(y[d]).tickSize(6).tickPadding(10));

        axisGroup.selectAll(".tick text")
          .style("font-weight", "bold") 
          .each(function () {
            const text = d3.select(this);
            const words = text.text();
            text.text(""); 

            for (let i = 0; i < words.length; i += 14) {
              text.append("tspan")
                .attr("x", 0)
                .attr("dy", i === 0 ? "0em" : "1.2em")
                .text(words.slice(i, i + 14));
            }
          });
      });

    g.selectAll(".axis line, .axis path")
      .style("stroke", "black");

    // Add axis labels and reordering buttons
    const axisLabels = g.selectAll(".axis-label-container")
      .data(dimensions)
      .enter()
      .append("g")
      .attr("class", "axis-label-container")
      .attr("transform", (d) => `translate(${x(d)},${height + 30})`);

    // Add text labels
    axisLabels.append("text")
      .attr("text-anchor", "middle")
      .style("fill", "black")
      .style("font-size", "14px")
      .each(function(d) {
        if (d.length > 10) {
          const mid = Math.ceil(d.length / 2);
          const firstPart = d.slice(0, mid);
          const secondPart = d.slice(mid);
          d3.select(this).append("tspan").attr("x", 0).attr("dy", "0em").text(firstPart);
          d3.select(this).append("tspan").attr("x", 0).attr("dy", "1.2em").text(secondPart);
        } else {
          d3.select(this).text(d);
        }
      });

    // Add left button for axis reordering
    axisLabels.append("rect")
      .attr("class", "move-button left")
      .attr("x", -30)
      .attr("y", 25)
      .attr("width", 20)
      .attr("height", 20)
      .attr("rx", 3)
      .attr("fill", (d) => order.indexOf(d) > 0 ? "steelblue" : "#ccc")
      .style("cursor", (d) => order.indexOf(d) > 0 ? "pointer" : "default")
      .on("click", function(event, d) {
        if (order.indexOf(d) > 0) {
          event.stopPropagation();
          moveAxisLeft(d);
        }
      });

    // Add left button arrow - Changed fill to white for better contrast
    axisLabels.append("text")
      .attr("class", "move-button-text left")
      .attr("x", -20)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("fill", "white")  // Changed from black to white
      .text("←")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("pointer-events", "none"); // Make text non-interactive

    // Add right button for axis reordering
    axisLabels.append("rect")
      .attr("class", "move-button right")
      .attr("x", 10)
      .attr("y", 25)
      .attr("width", 20)
      .attr("height", 20)
      .attr("rx", 3)
      .attr("fill", (d) => order.indexOf(d) < order.length - 1 ? "steelblue" : "#ccc")
      .style("cursor", (d) => order.indexOf(d) < order.length - 1 ? "pointer" : "default")
      .on("click", function(event, d) {
        if (order.indexOf(d) < order.length - 1) {
          event.stopPropagation();
          moveAxisRight(d);
        }
      });

    // Add right button arrow - Changed fill to white for better contrast
    axisLabels.append("text")
      .attr("class", "move-button-text right")
      .attr("x", 20)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("fill", "white")  // Changed from black to white
      .text("→")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("pointer-events", "none"); // Make text non-interactive

    // Add the legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 70}, 10)`);

    const uniqueClusters = [...new Set(data.map(d => d.bin_id))];

    uniqueClusters.forEach((cluster, i) => {
      legend.append("circle")
        .attr("cx", 0)
        .attr("cy", i * 20)
        .attr("r", 5)
        .attr("fill", color(cluster));

      legend.append("text")
        .attr("x", 10)
        .attr("y", i * 20 + 4)
        .text("cluster " + cluster)
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle");
    });
  }, [data, order, setOrder]);

  return (
    <div style={{ textAlign: "center" }}>
      <svg ref={svgRef} width={1500} height={600}></svg>
    </div>
  );
};

export default PCPPlot;
