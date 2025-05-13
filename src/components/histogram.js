"use client"
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BIN_RANGES = [
  { bin: 1, label: "50–64", range: [50, 65], color: "#4f46e5" },
  { bin: 2, label: "65–79", range: [65, 80], color: "#FFD600" },
  { bin: 3, label: "80–89", range: [80, 90], color: "#00C853" },
  { bin: 4, label: "90–100", range: [90, 101], color: "#FF1744" }
];

const Histogram = ({ data, selectedBins, updateSelectedBins }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data) return;
    drawHistogram(data);
  }, [data, selectedBins]);

  function drawHistogram(data) {
    const margin = { top: 50, right: 100, bottom: 60, left: 40 };
    const width = (360 - margin.left - margin.right)*1.10;
    const height = (200 - margin.top - margin.bottom) * 0.85;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const binCounts = BIN_RANGES.map(({ bin, range, label, color }) => ({
      bin,
      label,
      color,
      count: data.filter(d => +d.Exam_Score >= range[0] && +d.Exam_Score < range[1]).length
    }));

    const x = d3.scaleBand()
      .domain(binCounts.map(b => b.label))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(binCounts, b => b.count) || 1])
      .nice()
      .range([height, 0]);

    const getFill = (binObj) => {
      if (selectedBins.length === 0) return binObj.color;
      return selectedBins.includes(binObj.bin) ? binObj.color : "#ccc";
    };

    const titleGroup = svg.append("g")
      .attr("transform", `translate(${width / 2}, -30)`);

    titleGroup.append("text")
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Exam Score Distribution");

    const resetButton = titleGroup.append("g")
      .attr("transform", "translate(95, -5)")
      .style("cursor", "pointer")
      .on("click", () => updateSelectedBins([]));

    resetButton.append("circle")
      .attr("r", 8)
      .attr("fill", "#fff")
      .attr("stroke", "#4f46e5")
      .attr("stroke-width", 1.5);

    resetButton.append("path")
      .attr("d", "M-3,-2 A5,5 0 1,1 -3,2 M-3,2 L-5,0 M-3,2 L-1,0")
      .attr("fill", "none")
      .attr("stroke", "#4f46e5")
      .attr("stroke-width", 1.5)
      .attr("stroke-linecap", "round");

    svg.selectAll(".bar")
      .data(binCounts)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.label))
      .attr("y", d => y(d.count))
      .attr("width", x.bandwidth()* 0.8)
      .attr("height", d => height - y(d.count))
      .attr("fill", getFill)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        if (selectedBins.includes(d.bin)) {
          updateSelectedBins(selectedBins.filter(b => b !== d.bin));
        } else {
          updateSelectedBins([...selectedBins, d.bin].sort());
        }
      });

    svg.selectAll(".bar-label")
      .data(binCounts)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", d => x(d.label) + x.bandwidth()/2 - 5)
      .attr("y", d => y(d.count) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(d => d.count);

    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0))
    xAxis.selectAll("text")
      .style("cursor", "pointer")
      .attr("fill", d => {
        const binObj = binCounts.find(b => b.label === d);
        return getFill(binObj);
      })
      .on("click", function(event, label) {
        const binObj = binCounts.find(b => b.label === label);
        if (!binObj) return;
        if (selectedBins.includes(binObj.bin)) {
          updateSelectedBins(selectedBins.filter(b => b !== binObj.bin));
        } else {
          updateSelectedBins([...selectedBins, binObj.bin].sort());
        }
      });

    xAxis.select("path.domain").attr("stroke", "none");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 25)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Exam Score Bin");

    svg.append("text")
      .attr("transform", `rotate(-90)`)
      .attr("x", -height / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .style("font-size", "14px") 
      .style("font-weight", "bold")
      .text("Count");

    svg.append("g")
      .call(g => g.selectAll(".tick").remove())
      .call(g => g.selectAll("path.domain").remove());

    const legend = svg.append("g")
      .attr("transform", `translate(${width + 5}, 0)`);

    BIN_RANGES.forEach((bin, i) => {
      legend.append("rect")
        .attr("x", 0)
        .attr("y", i * 22)
        .attr("width", 16)
        .attr("height", 16)
        .attr("fill", bin.color);

      legend.append("text")
        .attr("x", 24)
        .attr("y", i * 22 + 12)
        .attr("font-size", "15px")
        .attr("alignment-baseline", "middle")
        .text(bin.label);
    });
  }

  return <svg ref={svgRef}></svg>;
};

export default Histogram;
