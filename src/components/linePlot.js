"use client"
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const MarksLinePlot = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5001/data")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!data.length) return;

    // Sort data by Exam_Score (new marks)
    const sorted = [...data].sort((a, b) => +a.Exam_Score - +b.Exam_Score);

    const margin = { top: 40, right: 40, bottom: 40, left: 60 };
    const width = 1600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale: index (sorted by Exam_Score)
    const x = d3
      .scaleLinear()
      .domain([0, sorted.length - 1])
      .range([0, width]);

    // Y scale: marks
    const y = d3
      .scaleLinear()
      .domain([
        30,
        100,
      ])
      .range([height, 0]);

    // Line generators
    const linePrev = d3
      .line()
      .x((d, i) => x(i))
      .y(d => y(+d.Previous_Scores));
    const lineNew = d3
      .line()
      .x((d, i) => x(i))
      .y(d => y(+d.Exam_Score));

    // Draw previous marks line
    svg
      .append("path")
      .datum(sorted)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", linePrev);

    // Draw new marks line
    svg
      .append("path")
      .datum(sorted)
      .attr("fill", "none")
      .attr("stroke", "hotpink")
      .attr("stroke-width", 2)
      .attr("d", lineNew);

    // Tooltip div
    let tooltip = d3.select(".lineplot-tooltip");
    if (tooltip.empty()) {
      tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "lineplot-tooltip")
        .style("position", "absolute")
        .style("background", "white")
        .style("padding", "8px 12px")
        .style("border-radius", "6px")
        .style("box-shadow", "0 2px 8px rgba(0,0,0,0.15)")
        .style("pointer-events", "none")
        .style("font-size", "13px")
        .style("opacity", 0);
    }

    // Add data points for previous marks
    svg
      .selectAll(".point-prev")
      .data(sorted)
      .enter()
      .append("circle")
      .attr("class", "point-prev")
      .attr("cx", (d, i) => x(i))
      .attr("cy", d => y(+d.Previous_Scores))
      .attr("r", 4)
      .attr("fill", "steelblue")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 7);
        tooltip
          .html(
            `<b>Previous Marks:</b> ${d.Previous_Scores}<br/><b>New Marks:</b> ${d.Exam_Score}`
          )
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 25 + "px")
          .transition()
          .duration(100)
          .style("opacity", 1);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 25 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 4);
        tooltip.transition().duration(150).style("opacity", 0);
      });

    // Add data points for new marks  
    svg
      .selectAll(".point-new")
      .data(sorted)
      .enter()
      .append("circle")
      .attr("class", "point-new")
      .attr("cx", (d, i) => x(i))
      .attr("cy", d => y(+d.Exam_Score))
      .attr("r", 4)
      .attr("fill", "hotpink")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 7);
        tooltip
          .html(
            `<b>Previous Marks:</b> ${d.Previous_Scores}<br/><b>New Marks:</b> ${d.Exam_Score}`
          )
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 25 + "px")
          .transition()
          .duration(100)
          .style("opacity", 1);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 25 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 4);
        tooltip.transition().duration(150).style("opacity", 0);
      });

    // Axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(10)
          .tickFormat((d) => (d % 1 === 0 ? d : ""))
      )
      .append("text")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text("Student (sorted by New Marks)");

    svg
      .append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -45)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text("Marks");

    // Legend
    svg
      .append("circle")
      .attr("cx", width - 120)
      .attr("cy", -10)
      .attr("r", 6)
      .attr("fill", "steelblue");
    svg
      .append("text")
      .attr("x", width - 110)
      .attr("y", -7)
      .attr("alignment-baseline", "middle")
      .style("font-size", "14px")
      .text("Previous Marks");

    svg
      .append("circle")
      .attr("cx", width - 120)
      .attr("cy", 15)
      .attr("r", 6)
      .attr("fill", "hotpink");
    svg
      .append("text")
      .attr("x", width - 110)
      .attr("y", 18)
      .attr("alignment-baseline", "middle")
      .style("font-size", "14px")
      .text("New Marks");

    // Title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .text("Previous Marks vs New Marks (Sorted by New Marks)");
  }, [data]);

  return (
    <div style={{ textAlign: "center" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default MarksLinePlot;
