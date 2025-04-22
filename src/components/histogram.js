"use client"
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const Histogram = () => {
  const [data, setData] = useState([]);
  const svgRef = useRef();

  useEffect(() => {
    // Fetch data from Flask API
    const fetchData = async () => {
      const response = await fetch('http://127.0.0.1:5001/data');  // Update this URL to match your Flask server
      console.log(response);
      const result = await response.json();
      console.log(result);
      setData(result);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      // Extract 'Score' values from the data
      const scores = data.map(d => d.Exam_Score);

      console.log(scores);

      // Set dimensions for the SVG container
      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const width = 800 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      // Create SVG container
      const svg = d3.select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Create histogram bins
      const histogram = d3.histogram()
        .value(d => d)
        .domain(d3.extent(scores))  // Set the domain to cover all scores
        .thresholds(d3.range(50, 102, 13));  // Bins for the Score ranges: [0-25], [25-50], [50-75], [75-100]

      const bins = histogram(scores);

      // Set scales
      const x = d3.scaleBand()
        .domain(bins.map(d => `${d.x0} - ${d.x1}`))
        .range([0, width])
        .padding(0.1);

      const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .nice()
        .range([height, 0]);

      // Append X axis
      svg.append('g')
        .selectAll('.tick')
        .data(bins)
        .enter()
        .append('text')
        .attr('class', 'x-axis-tick')
        .attr('x', d => x(`${d.x0} - ${d.x1}`) + x.bandwidth() / 2)
        .attr('y', height + 30)
        .attr('text-anchor', 'middle')
        .text(d => `${d.x0} - ${d.x1}`);

      // Append bars
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
    }
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default Histogram;
