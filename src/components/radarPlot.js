"use client"
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const RadarPlot = ({ initialFeatures }) => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [features, setFeatures] = useState(initialFeatures || [
    'Hours_Studied', 'Attendance', 'Sleep_Hours', 'Previous_Scores'
  ]);

  const numericFeatures = [
    'Hours_Studied', 'Attendance', 'Sleep_Hours', 'Previous_Scores',
    'Physical_Activity', 'Tutoring_Sessions', 'Exam_Score'
  ];

  useEffect(() => {
    fetch('http://127.0.0.1:5001/data')
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error(err));
  }, []);

  const changeFeature = (index, direction) => {
    setFeatures(prev => {
      const newFeatures = [...prev];
      const currIndex = numericFeatures.indexOf(prev[index]);
      const newIndex = (currIndex + direction + numericFeatures.length) % numericFeatures.length;
      newFeatures[index] = numericFeatures[newIndex];
      return newFeatures;
    });
  };

  useEffect(() => {
    if (!data.length) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const width = 600, height = 600;
    const margin = 60;
    const radius = Math.min(width, height) / 2 - margin;
    const levels = 4;

    const colors = {
      1: "#FF7676",
      2: "#FFB876",
      3: "#4F97FF",
      4: "#76FF8A"
    };

    const svg = d3.select(svgRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width/2},${height/2})`);

    const dataBins = {};
    for (let bin = 1; bin <= 4; bin++) {
      const binData = data.filter(d => {
        const score = +d.Exam_Score;
        if (bin === 1) return score >= 50 && score < 65;
        if (bin === 2) return score >= 65 && score < 80;
        if (bin === 3) return score >= 80 && score < 90;
        if (bin === 4) return score >= 90 && score <= 100;
        return false;
      });

      dataBins[bin] = features.map(feat => ({
        feature: feat,
        value: d3.mean(binData, d => +d[feat]) || 0
      }));
    }

    const featureScales = {};
    const featureMaxes = {};
    features.forEach(feat => {
      const max = d3.max(data, d => +d[feat]) * 1.1;
      featureMaxes[feat] = max;
      featureScales[feat] = d3.scaleLinear().domain([0, max]).range([0, radius]);
    });

    const angleSlice = (Math.PI * 2) / features.length;

    // Draw levels (circles) and value labels for each axis
    for (let level = 1; level <= levels; level++) {
      const r = (radius / levels) * level;
      svg.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", level === levels ? 2 : 1);
    }

    // Draw axes and value labels
    for (let i = 0; i < features.length; i++) {
      const angle = i * angleSlice - Math.PI / 2;
      const lineX = radius * Math.cos(angle);
      const lineY = radius * Math.sin(angle);

      svg.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", lineX)
        .attr("y2", lineY)
        .attr("stroke", "#999")
        .attr("stroke-width", 1);

      // Value labels at each level
      for (let level = 1; level <= levels; level++) {
        const r = (radius / levels) * level;
        const value = featureScales[features[i]].invert(r);
        const labelX = r * Math.cos(angle);
        const labelY = r * Math.sin(angle);

        svg.append("text")
          .attr("x", labelX)
          .attr("y", labelY)
          .attr("dy", "0.35em")
          .attr("text-anchor", labelX > 10 ? "start" : labelX < -10 ? "end" : "middle")
          .text(value.toFixed(1))
          .style("font-size", "10px")
          .style("fill", "#333");
      }

      const labelG = svg.append("g")
        .attr("transform", `translate(${1.1 * lineX},${1.1 * lineY})`);

      labelG.append("text")
        .attr("text-anchor", "middle")
        .text(features[i])
        .style("font-size", "12px");

      labelG.append("circle")
        .attr("cx", -40)
        .attr("cy", 0)
        .attr("r", 8)
        .attr("fill", "steelblue")
        .style("cursor", "pointer")
        .on("click", () => changeFeature(i, -1));

      labelG.append("text")
        .attr("x", -40)
        .attr("y", 4)
        .attr("text-anchor", "middle")
        .text("←")
        .style("fill", "white")
        .style("font-size", "10px")
        .style("pointer-events", "none");

      labelG.append("circle")
        .attr("cx", 40)
        .attr("cy", 0)
        .attr("r", 8)
        .attr("fill", "steelblue")
        .style("cursor", "pointer")
        .on("click", () => changeFeature(i, 1));

      labelG.append("text")
        .attr("x", 40)
        .attr("y", 4)
        .attr("text-anchor", "middle")
        .text("→")
        .style("fill", "white")
        .style("font-size", "10px")
        .style("pointer-events", "none");
    }

    Object.entries(dataBins).forEach(([bin, binData]) => {
      const points = binData.map((d, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const scale = featureScales[d.feature];
        return {
          x: scale(d.value) * Math.cos(angle),
          y: scale(d.value) * Math.sin(angle)
        };
      });

      svg.append("path")
        .datum(points)
        .attr("d", d3.line().x(d => d.x).y(d => d.y).curve(d3.curveLinearClosed))
        .attr("fill", colors[bin])
        .attr("fill-opacity", 0.3)
        .attr("stroke", colors[bin])
        .attr("stroke-width", 2);

      svg.selectAll(`.radar-point-${bin}`)
        .data(points)
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 4)
        .attr("fill", colors[bin]);
    });

    const legend = svg.append("g")
      .attr("transform", `translate(${-width / 2 + 20}, ${-height / 2 + 20})`);

    Object.entries(colors).forEach(([bin, color], i) => {
      legend.append("rect")
        .attr("x", 0)
        .attr("y", i * 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", color);

      let binRange;
      if (bin === '1') binRange = "50-64";
      else if (bin === '2') binRange = "65-79";
      else if (bin === '3') binRange = "80-89";
      else binRange = "90-100";

      legend.append("text")
        .attr("x", 25)
        .attr("y", i * 20 + 12)
        .text(`Score Group ${bin}: ${binRange}`)
        .style("font-size", "12px");
    });
  }, [data, features]);

  return <div ref={svgRef}></div>;
};

export default RadarPlot;
