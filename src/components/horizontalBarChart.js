"use client"
import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

const HorizontalBarChart = ({ variables }) => {
  const ref = useRef()
  
  useEffect(() => {
    const fetchDataAndDraw = async () => {
      const response = await fetch('http://localhost:5001/data')
      const rawData = await response.json()
      
      // Process data client-side
      const processedData = variables.map(varName => ({
        varName,
        counts: Array.from(
          d3.rollup(rawData, 
            v => v.length,
            d => d[varName]
          ),
          ([key, value]) => ({ category: key, count: value })
        ).sort((a, b) => b.count - a.count)
      }))

      drawChart(processedData)
    }

    fetchDataAndDraw()
  }, [variables])

  const drawChart = (dataset) => {
    d3.select(ref.current).selectAll("*").remove()

    // Dimensions
    const width = 600, height = 600
    const margin = { top: 30, right: 40, bottom: 120, left: 160 }

    // Create SVG
    const svg = d3.select(ref.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    // Process data
    const maxCount = d3.max(dataset.flatMap(d => 
      d.counts.map(c => c.count)
    )) || 1

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, maxCount])
      .range([margin.left, width - margin.right])

    const yScale = d3.scaleBand()
      .domain(dataset.map(d => d.varName))
      .range([height - margin.bottom, margin.top])
      .padding(0.2)

    // Create variable groups
    const variableGroups = svg.selectAll('.variable-group')
      .data(dataset)
      .enter().append('g')
      .attr('transform', d => `translate(0,${yScale(d.varName)})`)

    // Add bars and labels
    variableGroups.each(function(d) {
        const categoryScale = d3.scaleBand()
          .domain(d.counts.map(c => c.category))
          .range([0, yScale.bandwidth()])
          .padding(0.05);
      
        const group = d3.select(this);
        
        // Bars
        group.selectAll('rect')
          .data(d.counts)
          .enter().append('rect')
          .attr('x', margin.left)
          .attr('y', c => categoryScale(c.category))
          .attr('width', c => xScale(c.count) - margin.left)
          .attr('height', categoryScale.bandwidth() * 0.95)
          .attr('fill', '#4f46e5')
          .attr('rx', 4);
      
        // Count labels (top of bars)
        group.selectAll('.count-label')
          .data(d.counts)
          .enter().append('text')
          .attr('class', 'count-label')
          .attr('x', c => xScale(c.count) + 28)
          .attr('y', c => categoryScale(c.category) + 11)
          .attr('text-anchor', 'end')
          .style('font-size', '0.7em')
          .style('fill', 'black')
          .text(c => c.count);
      
        // Category labels (right side)
        group.selectAll('.category-label')
          .data(d.counts)
          .enter().append('text')
          .attr('class', 'category-label')
          .attr('x', c => xScale(c.count) - 5)
          .attr('y', c => categoryScale(c.category) + categoryScale.bandwidth()/2)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'end')
          .style('font-size', '0.7em')
          .style('fill', 'white')
          .text(c => c.category);
      });

    // Variable labels (multi-line)
    variableGroups.append('text')
      .attr('x', margin.left - 15)
      .attr('y', yScale.bandwidth() / 2 - 10)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '0.85em')
      .selectAll('tspan')
      .data(d => d.varName.split('_'))
      .enter()
      .append('tspan')
      .attr('x', margin.left - 15)
      .attr('dy', (d, i) => i === 0 ? 0 : '1.2em')
      .text(d => d.charAt(0).toUpperCase() + d.slice(1).toLowerCase())
  }

  return <div ref={ref} />
}

export default HorizontalBarChart
