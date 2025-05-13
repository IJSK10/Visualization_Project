"use client"
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const ScatterPlotMatrix = ({ numericFeatures, data, onBrush }) => {
  const [xIndex, setXIndex] = useState(0);
  const [yIndex, setYIndex] = useState(1);
  const svgRef = useRef();

  const moveXLeft = () => setXIndex(prev => (prev > 0 ? prev - 1 : numericFeatures.length - 1));
  const moveXRight = () => setXIndex(prev => (prev < numericFeatures.length - 1 ? prev + 1 : 0));
  const moveYLeft = () => setYIndex(prev => (prev > 0 ? prev - 1 : numericFeatures.length - 1));
  const moveYRight = () => setYIndex(prev => (prev < numericFeatures.length - 1 ? prev + 1 : 0));

  useEffect(() => {
    if (!data.length || !numericFeatures) return;

    const xFeature = numericFeatures[xIndex];
    const yFeature = numericFeatures[yIndex];

    d3.select(svgRef.current).selectAll("*").remove();

    const binColors = {
      1: "#4f46e5",   
      2: "#FFD600",   
      3: "#00C853",   
      4: "#FF1744"    
    };

    
    const margin = { top: 50, right: 50, bottom: 50, left: 80 };
    
    const outerWidth = 418;
    const outerHeight = 264;
    
    const width = (outerWidth - margin.left - margin.right) * 1.1;
    const height = (outerHeight - margin.top - margin.bottom) * 1.1;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([d3.min(data, d => +d[xFeature]) * 0.9, d3.max(data, d => +d[xFeature]) * 1.1])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([d3.min(data, d => +d[yFeature]) * 0.9, d3.max(data, d => +d[yFeature]) * 1.1])
      .range([height, 0]);

    
    const brush = d3.brush()
      .extent([[0, 0], [width, height]])
      .on('end', (event) => {
        if (!event.selection) {
          onBrush([]);
          return;
        }
        const [[x0, y0], [x1, y1]] = event.selection;
        const selectedPoints = data.filter(d => {
          const cx = x(+d[xFeature]);
          const cy = y(+d[yFeature]);
          return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
        });
        onBrush(selectedPoints.map(d => d.id));
      });

    svg.append("g")
      .attr("class", "brush")
      .call(brush);

    
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(+d[xFeature]))
      .attr('cy', d => y(+d[yFeature]))
      .attr('r', 4)
      .style('fill', d => binColors[d.bin_id] || '#bbb')
      .style('opacity', 0.7);

    
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "10px");

    
    const yAxis = d3.axisLeft(y)
      .ticks(y.ticks().length > 10 ? y.ticks().length / 2 : y.ticks().length)
      .tickSizeOuter(0);

    svg.append('g')
      .call(yAxis)
      .selectAll("text")
      .style("font-size", "10px");

    
    const xAxisLabel = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height + 40})`);
    
    
    xAxisLabel.append('rect')
      .attr('x', -70).attr('y', -8).attr('width', 15).attr('height', 15).attr('rx', 2)
      .attr('fill', 'steelblue').style('cursor', 'pointer').on('click', moveXLeft);
    xAxisLabel.append('text')
      .attr('x', -62).attr('y', 2).attr('text-anchor', 'middle')
      .attr('fill', 'white').style('pointer-events', 'none').style('font-size', '10px').text('←');
    
    
    xAxisLabel.append('text')
      .attr('x', 0).attr('y', 5).attr('text-anchor', 'middle')
      .style('font-weight', 'bold').style('font-size', '12px').text(xFeature);
    
    
    xAxisLabel.append('rect')
      .attr('x', 53).attr('y', -8).attr('width', 15).attr('height', 15).attr('rx', 2)
      .attr('fill', 'steelblue').style('cursor', 'pointer').on('click', moveXRight);
    xAxisLabel.append('text')
      .attr('x', 60).attr('y', 2).attr('text-anchor', 'middle')
      .attr('fill', 'white').style('pointer-events', 'none').style('font-size', '10px').text('→');

    
    const yAxisLabel = svg.append('g')
      .attr('transform', `translate(${-40}, ${height / 2}) rotate(-90)`);
    
    
    yAxisLabel.append('rect')
      .attr('x', -67).attr('y', -7).attr('width', 15).attr('height', 15).attr('rx', 2)
      .attr('fill', 'steelblue').style('cursor', 'pointer').on('click', moveYLeft);
    yAxisLabel.append('text')
      .attr('x', -62).attr('y', 4).attr('text-anchor', 'middle')
      .attr('fill', 'white').style('pointer-events', 'none').style('font-size', '10px').text('←');
    
    
    yAxisLabel.append('text')
      .attr('x', 0).attr('y', 5).attr('text-anchor', 'middle')
      .style('font-weight', 'bold').style('font-size', '12px').text(yFeature);
    
    
    yAxisLabel.append('rect')
      .attr('x', 53).attr('y', -7).attr('width', 15).attr('height', 15).attr('rx', 2)
      .attr('fill', 'steelblue').style('cursor', 'pointer').on('click', moveYRight);
    yAxisLabel.append('text')
      .attr('x', 58).attr('y', 4).attr('text-anchor', 'middle')
      .attr('fill', 'white').style('pointer-events', 'none').style('font-size', '10px').text('→');

    
    const titleGroup = svg.append('g')
      .attr('transform', `translate(${width/2}, -25)`);

    titleGroup.append('text')
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Scatter Plot');

    const resetButton = titleGroup.append("g")
      .attr("transform", "translate(60, -7)")
      .style("cursor", "pointer")
      .on("click", () => onBrush([]));

    
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

  }, [data, xIndex, yIndex, numericFeatures, onBrush]);

  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ScatterPlotMatrix;
