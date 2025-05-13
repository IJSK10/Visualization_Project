"use client"
import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

const BIN_RANGES = [
  { bin: 1, label: "50–64", range: [50, 65], color: "#4f46e5" },
  { bin: 2, label: "65–79", range: [65, 80], color: "#FFD600" },
  { bin: 3, label: "80–89", range: [80, 90], color: "#00C853" },
  { bin: 4, label: "90–100", range: [90, 101], color: "#FF1744" }
];

const ALL_CATEGORIES = {
  Distance_from_Home: ["Near", "Moderate", "Far"],
  Parental_Education_Level: ["High School", "College", "Postgraduate"],
  Teacher_Quality: ["Low", "Medium", "High"],
  Family_Income: ["Low", "Medium", "High"],
  Motivation_Level: ["Low", "Medium", "High"],
  Access_to_Resources: ["Low", "Medium", "High"],
  Parental_Involvement: ["Low", "Medium", "High"],
  Learning_Disabilities: ["Yes", "No"],
  Peer_Influence: ["Positive", "Neutral", "Negative"],
  Extracurricular_Activities: ["Yes", "No"]
};

function getBin(score) {
  for (const bin of BIN_RANGES) {
    if (score >= bin.range[0] && score < bin.range[1]) return bin;
  }
  return null;
}

const HorizontalBarChart = ({
  data,
  variables,
  distanceFromHome, updateDistanceFromHome,
  parentalEducationLevel, updateParentalEducationLevel,
  teacherQuality, updateTeacherQuality,
  familyIncome, updateFamilyIncome,
  motivationLevel, updateMotivationLevel,
  accessToResources, updateAccessToResources,
  parentalInvolvement, updateParentalInvolvement,
  learningDisabilities, updateLearningDisabilities,
  peerInfluence, updatePeerInfluence,
  extracurricularActivities, updateExtracurricularActivities,
  selectedBins
}) => {
  const ref = useRef();

  const getStateAndUpdater = (varName) => {
    switch (varName) {
      case "Distance_from_Home": return [distanceFromHome, updateDistanceFromHome];
      case "Parental_Education_Level": return [parentalEducationLevel, updateParentalEducationLevel];
      case "Teacher_Quality": return [teacherQuality, updateTeacherQuality];
      case "Family_Income": return [familyIncome, updateFamilyIncome];
      case "Motivation_Level": return [motivationLevel, updateMotivationLevel];
      case "Access_to_Resources": return [accessToResources, updateAccessToResources];
      case "Parental_Involvement": return [parentalInvolvement, updateParentalInvolvement];
      case "Learning_Disabilities": return [learningDisabilities, updateLearningDisabilities];
      case "Peer_Influence": return [peerInfluence, updatePeerInfluence];
      case "Extracurricular_Activities": return [extracurricularActivities, updateExtracurricularActivities];
      default: return [[], () => {}];
    }
  };

  const resetAllFilters = () => {
    updateDistanceFromHome([]);
    updateParentalEducationLevel([]);
    updateTeacherQuality([]);
    updateFamilyIncome([]);
    updateMotivationLevel([]);
    updateAccessToResources([]);
    updateParentalInvolvement([]);
    updateLearningDisabilities([]);
    updatePeerInfluence([]);
    updateExtracurricularActivities([]);
  };

  useEffect(() => {
    if (!data) return;

    const processedData = variables.map(varName => {
      const allCategories = ALL_CATEGORIES[varName] || [];
      const counts = allCategories.map(cat => {
        const filtered = data.filter(d => d[varName] === cat);
        const binCounts = BIN_RANGES.map(bin => ({
          bin: bin.bin,
          color: bin.color,
          count: filtered.filter(d => {
            const score = +d.Exam_Score;
            return score >= bin.range[0] && score < bin.range[1];
          }).length
        }));
        const total = binCounts.reduce((sum, b) => sum + b.count, 0);
        return { category: cat, binCounts, total };
      });
      return { varName, counts };
    });

    drawChart(processedData);
    // eslint-disable-next-line
  }, [
    data, variables,
    distanceFromHome, parentalEducationLevel, teacherQuality,
    familyIncome, motivationLevel, accessToResources, parentalInvolvement,
    learningDisabilities, peerInfluence, extracurricularActivities, selectedBins
  ]);

  const drawChart = (dataset) => {
    d3.select(ref.current).selectAll("*").remove();

    const width = 580, height = 770;
    const margin = { top: 60, right: 40, bottom: 100, left: 200 };

    const svg = d3.select(ref.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const titleGroup = svg.append('g');

    titleGroup.append('text')
      .attr('x', width / 2 - 40)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .style('font-weight', 'bold')
      .text('Student Performance Factors Distribution');


    const resetButton = titleGroup.append("g")
      .attr("transform", "translate(470, 27)")
      .style("cursor", "pointer")
      .on("click", resetAllFilters);

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

    const maxCount = d3.max(dataset.flatMap(d =>
      d.counts.map(c => c.total)
    )) || 1;

    const xScale = d3.scaleLinear()
      .domain([0, maxCount])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleBand()
      .domain(dataset.map(d => d.varName))
      .range([height - margin.bottom, margin.top])
      .padding(0.2);

    const variableGroups = svg.selectAll('.variable-group')
      .data(dataset)
      .enter().append('g')
      .attr('transform', d => `translate(0,${yScale(d.varName)})`);

    variableGroups.each(function(d) {
      const [currentArray, updateArray] = getStateAndUpdater(d.varName);

      const categoryScale = d3.scaleBand()
        .domain(d.counts.map(c => c.category))
        .range([0, yScale.bandwidth()])
        .padding(0.05);

      const group = d3.select(this);

      group.selectAll('g.category')
        .data(d.counts)
        .enter().append('g')
        .attr('class', 'category')
        .attr('transform', c => `translate(0,${categoryScale(c.category)})`)
        .each(function(c) {
          let x0 = margin.left;
          d3.select(this).selectAll('rect')
            .data(c.binCounts)
            .enter().append('rect')
            .attr('x', (bin, i) => {
              const prevWidth = c.binCounts.slice(0, i).reduce((sum, b) => sum + (xScale(b.count) - xScale(0)), 0);
              return x0 + prevWidth;
            })
            .attr('y', 0)
            .attr('width', bin => Math.max(0, xScale(bin.count) - xScale(0)))
            .attr('height', categoryScale.bandwidth() * 0.95)
            .attr('fill', bin => (currentArray.length === 0 || currentArray.includes(c.category)) ? bin.color : '#ccc')
            .attr('rx', 4)
            .style('cursor', 'pointer')
            .on('click', function(event) {
              event.stopPropagation();
              if (currentArray.includes(c.category)) {
                updateArray(currentArray.filter(val => val !== c.category));
              } else {
                updateArray([...currentArray, c.category]);
              }
            });
        });

      group.selectAll('.total-label')
        .data(d.counts)
        .enter().append('text')
        .attr('class', 'total-label')
        .attr('x', c => margin.left + c.binCounts.reduce((sum, b) => sum + (xScale(b.count) - xScale(0)), 0) + 12)
        .attr('y', c => categoryScale(c.category) + 11)
        .attr('text-anchor', 'start')
        .style('font-size', '0.7em')
        .style('fill', 'black')
        .text(c => c.total);

      group.selectAll('.category-label')
        .data(d.counts)
        .enter().append('text')
        .attr('class', 'category-label')
        .attr('x', c => margin.left - 5)
        .attr('y', c => categoryScale(c.category) + categoryScale.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .style('font-size', '0.7em')
        .style('fill', 'black')
        .style('cursor', 'pointer')
        .on('click', function(event, c) {
          event.stopPropagation();
          if (currentArray.includes(c.category)) {
            updateArray(currentArray.filter(val => val !== c.category));
          } else {
            updateArray([...currentArray, c.category]);
          }
        })
        .text(c => c.category);
    });

    variableGroups.append('text')
      .attr('x', margin.left - 80)
      .attr('y', yScale.bandwidth() / 2 - 12)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '0.90em')
      .style('cursor', 'pointer')
      .style('font-weight', 'bold')
      .on('click', function(event, d) {
        event.stopPropagation();
        const [, updateArray] = getStateAndUpdater(d.varName);
        updateArray([]);
      })
      .selectAll('tspan')
      .data(d => d.varName.split('_'))
      .enter()
      .append('tspan')
      .attr('x', margin.left - 80)
      .attr('dy', (d, i) => i === 0 ? 0 : '0.9em')
      .text(d => d.charAt(0).toUpperCase() + d.slice(1).toLowerCase());
  };

  return <div ref={ref} />;
};

export default HorizontalBarChart;
