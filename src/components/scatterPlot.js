"use client"
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const ScatterPlotMatrix = ({ numericFeatures }) => {
  const [xIndex, setXIndex] = useState(0);
  const [yIndex, setYIndex] = useState(1);
  const svgRef = useRef();
  const [data, setData] = useState([]);

  // Navigation handlers
  const moveXLeft = () => setXIndex(prev => (prev > 0 ? prev - 1 : numericFeatures.length - 1));
  const moveXRight = () => setXIndex(prev => (prev < numericFeatures.length - 1 ? prev + 1 : 0));
  const moveYLeft = () => setYIndex(prev => (prev > 0 ? prev - 1 : numericFeatures.length - 1));
  const moveYRight = () => setYIndex(prev => (prev < numericFeatures.length - 1 ? prev + 1 : 0));

  // Fetch data
  useEffect(() => {
    fetch('http://127.0.0.1:5001/data')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error(err));
  }, []);

  // Draw scatter plot
  useEffect(() => {
    if (!data.length || !numericFeatures) return;
    
    const xFeature = numericFeatures[xIndex];
    const yFeature = numericFeatures[yIndex];
    
    // Clear previous SVG
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Set dimensions
    const margin = { top: 50, right: 50, bottom: 50, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const x = d3.scaleLinear()
      .domain([d3.min(data, d => +d[xFeature]) * 0.9, d3.max(data, d => +d[xFeature]) * 1.1])
      .range([0, width]);
    
    const y = d3.scaleLinear()
      .domain([d3.min(data, d => +d[yFeature]) * 0.9, d3.max(data, d => +d[yFeature]) * 1.1])
      .range([height, 0]);
    
    // Create axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));
    
    svg.append('g')
      .call(d3.axisLeft(y));
    
    // Add points
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(+d[xFeature]))
      .attr('cy', d => y(+d[yFeature]))
      .attr('r', 4)
      .style('fill', '#4f46e5')
      .style('opacity', 0.7);
    
    // Add navigation buttons for X axis
    const xAxisLabel = svg.append('g')
      .attr('transform', `translate(${width/2}, ${height + 40})`);
    
    // Left button for X axis
    xAxisLabel.append('rect')
      .attr('x', -85)
      .attr('y', -15)
      .attr('width', 20)
      .attr('height', 20)
      .attr('rx', 3)
      .attr('fill', 'steelblue')
      .style('cursor', 'pointer')
      .on('click', moveXLeft);
    
    xAxisLabel.append('text')
      .attr('x', -75)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .style('pointer-events', 'none')
      .text('←');
    
    // X axis label
    xAxisLabel.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .text(xFeature);
    
    // Right button for X axis
    xAxisLabel.append('rect')
      .attr('x', 65)
      .attr('y', -15)
      .attr('width', 20)
      .attr('height', 20)
      .attr('rx', 3)
      .attr('fill', 'steelblue')
      .style('cursor', 'pointer')
      .on('click', moveXRight);
    
    xAxisLabel.append('text')
      .attr('x', 75)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .style('pointer-events', 'none')
      .text('→');
    
    // Add navigation buttons for Y axis
    const yAxisLabel = svg.append('g')
      .attr('transform', `translate(${-40}, ${height/2}) rotate(-90)`);
    
    // Left button for Y axis
    yAxisLabel.append('rect')
      .attr('x', -85)
      .attr('y', -15)
      .attr('width', 20)
      .attr('height', 20)
      .attr('rx', 3)
      .attr('fill', 'steelblue')
      .style('cursor', 'pointer')
      .on('click', moveYLeft);
    
    yAxisLabel.append('text')
      .attr('x', -75)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .style('pointer-events', 'none')
      .text('←');
    
    // Y axis label
    yAxisLabel.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .text(yFeature);
    
    // Right button for Y axis
    yAxisLabel.append('rect')
      .attr('x', 65)
      .attr('y', -15)
      .attr('width', 20)
      .attr('height', 20)
      .attr('rx', 3)
      .attr('fill', 'steelblue')
      .style('cursor', 'pointer')
      .on('click', moveYRight);
    
    yAxisLabel.append('text')
      .attr('x', 75)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .style('pointer-events', 'none')
      .text('→');
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -25)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`${yFeature} vs ${xFeature}`);
      
  }, [data, xIndex, yIndex, numericFeatures]);

  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ScatterPlotMatrix;
