"use client"
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const RadarPlot = ({ initialFeatures, data }) => {
  const svgRef = useRef();
  const [features] = useState(['Attendance','Hours_Studied', 'Sleep_Hours', 'Tutoring_Sessions']);

  const colors = {
    1: "#4f46e5",
    2: "#FFD600",
    3: "#00C853",
    4: "#FF1744"
  };

  const featureRanges = {
    'Attendance': 100,
    'Hours_Studied': 50,
    'Sleep_Hours': 10,
    'Tutoring_Sessions': 8
  };

  useEffect(() => {
    if (!data.length) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const originalWidth = 350 * 2;
    const originalHeight = 200 * 1.2;
    const width = originalWidth * 1.275; 
    const height = originalHeight * 1.275;
    const margin = 65;
    const radius = Math.min(width, height) / 2 - margin + 17;
    const levels = 3;
    const GAP = 15;

    const svg = d3.select(svgRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    svg.append("text")
      .attr("x", width / 2 - 280)
      .attr("y", 24)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Performance Radar");

    const radarGroup = svg.append("g")
      .attr("transform", `translate(160,${height/2 + GAP})`);

    const dataBins = {};
    for (let bin = 1; bin <= 4; bin++) {
      const binData = data.filter(d => {
        const score = +d.Exam_Score;
        if (bin === 1) return score > 50 && score <= 65;
        if (bin === 2) return score >= 66 && score <= 75;
        if (bin === 3) return score >= 76 && score <= 90;
        if (bin === 4) return score >= 91 && score <= 100;
        return false;
      });

      dataBins[bin] = features.map(feat => ({
        feature: feat,
        value: (d3.mean(binData, d => +d[feat]) || 0) / featureRanges[feat]
      }));
    }

    const featureScales = {};
    features.forEach(feat => {
      featureScales[feat] = d3.scaleLinear()
        .domain([0, 1])
        .range([0, radius]);
    });

    const angleSlice = (Math.PI * 2) / features.length;

    for (let level = 1; level <= levels; level++) {
      const r = (radius / levels) * level;
      radarGroup.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1);
    }

    features.forEach((feat, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const lineX = radius * Math.cos(angle);
      const lineY = radius * Math.sin(angle);

      radarGroup.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", lineX)
        .attr("y2", lineY)
        .attr("stroke", "#999")
        .attr("stroke-width", 1);

      let labelX = 1.15 * radius * Math.cos(angle);
      let labelY = 1.15 * radius * Math.sin(angle);

      if (i === 0) labelY -= 5;
      else if (i === 1) { labelX += 15; labelY += 5; }
      else if (i === 2) labelY += 5;
      else if (i === 3) { labelX -= 15; labelY += 5; }

      const words = feat.split('_');
      const labelG = radarGroup.append("g")
        .attr("transform", `translate(${labelX},${labelY})`);

      labelG.selectAll("tspan")
        .data(words)
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", (d, i) => i * 8)
        .style("font-size", "12px")
        .text(d => d);
    });

    Object.entries(dataBins).forEach(([bin, binData]) => {
      const points = binData.map((d, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const scale = featureScales[d.feature];
        return {
          x: scale(d.value) * Math.cos(angle),
          y: scale(d.value) * Math.sin(angle)
        };
      });

      radarGroup.append("path")
        .datum(points)
        .attr("d", d3.line().x(d => d.x).y(d => d.y).curve(d3.curveLinearClosed))
        .attr("fill", colors[bin])
        .attr("fill-opacity", 0.3)
        .attr("stroke", colors[bin])
        .attr("stroke-width", 1.5);
    });

    for (let level = 1; level <= levels; level++) {
      features.forEach((feat, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const r = (radius / levels) * level;
        const levelValue = (featureRanges[feat] / levels * level).toFixed(1);

        radarGroup.append("text")
          .attr("x", r * Math.cos(angle))
          .attr("y", r * Math.sin(angle) - 4)
          .attr("text-anchor", "middle")
          .style("font-size", "10.5px")
          .style("font-weight", "bold")
          .style("fill", "#111")
          .text(levelValue);
      });
    }
  }, [data, features]);

  return <div className="pl-5" ref={svgRef} />;
};

export default RadarPlot;
