"use client"
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const Histogram = () => {
  const [data, setData] = useState([]);
  const svgRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://127.0.0.1:5001/data');
      const result = await response.json();
      setData(result);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      const scores = data.map(d => d.Exam_Score);
      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const width = 400 - margin.left - margin.right;
      const height = 200 - margin.top - margin.bottom;

      // Clear previous SVG contents
      d3.select(svgRef.current).selectAll("*").remove();

      const svg = d3.select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const histogram = d3.histogram()
        .value(d => d)
        .domain(d3.extent(scores))
        .thresholds(d3.range(50, 102, 13));

      const bins = histogram(scores);

      const x = d3.scaleBand()
        .domain(bins.map(d => `${d.x0} - ${d.x1}`))
        .range([0, width])
        .padding(0.1);

      const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .nice()
        .range([height, 0]);

      // Create bars
      svg.selectAll('.bar')
        .data(bins)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(`${d.x0} - ${d.x1}`))
        .attr('y', d => y(d.length))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.length))
        .attr('fill', 'steelblue');

      // Add text labels
      svg.selectAll('.bar-label')
        .data(bins)
        .enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('x', d => x(`${d.x0} - ${d.x1}`) + x.bandwidth() / 2)
        .attr('y', d => y(d.length) - 5)  // 5px above bar top
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .style('font-size', '10px')
        .text(d => d.length);

      // X-axis
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));
    }
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default Histogram;
