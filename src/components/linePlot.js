"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

const StatsBarPlot = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data.length) return;

    const avgExam = d3.mean(data, d => +d.Exam_Score);
    const avgPrev = d3.mean(data, d => +d.Previous_Scores);
    const diffs = data.map(d => +d.Exam_Score - +d.Previous_Scores);
    const stdDev = d3.deviation(diffs);
    
    const higherCount = data.filter(d => +d.Exam_Score > +d.Previous_Scores).length;
    const percentHigher = (higherCount / data.length) * 100;

    const barsData = [
      { label: "Average Previous Score", value: avgPrev },
      { label: "Average Exam Score", value: avgExam },
      { label: "Standard Deviation", value: stdDev },
      { label: "%of students Scored Higher", value: percentHigher }
    ];

    const margin = { top: 50, right: 40, bottom: 70, left: 40 };
    const width = (400 - margin.left - margin.right)*1.25;
    const height = (200 - margin.top - margin.bottom);

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const barAreaWidth = width * 0.8;
    const x = d3
      .scaleBand()
      .domain(barsData.map(d => d.label))
      .range([0, barAreaWidth])
      .padding(0.30);

    const maxValue = Math.max(...barsData.map(d => d.value), 100);
    const y = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([height, 0]);

    svg
      .selectAll(".bar")
      .data(barsData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.label))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", "hotpink");

    svg
      .selectAll(".value-label")
      .data(barsData)
      .enter()
      .append("text")
      .attr("class", "value-label")
      .attr("x", d => x(d.label) + x.bandwidth() / 2)
      .attr("y", d => y(d.value) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "10.5px")
      .style("font-weight", "bold")
      .text(d => d.value !== undefined && !isNaN(d.value) ? d.value.toFixed(1) : "N/A");

    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    xAxis.selectAll("text")
      .each(function(d) {
        const words = d.split(" ");
        d3.select(this)
          .text(null)
          .selectAll("tspan")
          .data(words)
          .enter()
          .append("tspan")
          .attr("x", 0)
          .attr("dy", (word, i) => i === 0 ? "1em" : "1.2em")
          .text(word => word);
      })
      .attr("text-anchor", "middle")
      .attr("dx", "0em")
      .attr("dy", "1.5em");

    svg.append("g")
      .call(d3.axisLeft(y)
        .ticks(Math.ceil(maxValue / 20))
        .tickFormat(d => `${d}`)
      );

    svg
      .append("text")
      .attr("x", barAreaWidth / 2)
      .attr("y", -25)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Score Statistics");

  }, [data]);

  return (
    <div style={{ textAlign: "center", color: "black" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default StatsBarPlot;
