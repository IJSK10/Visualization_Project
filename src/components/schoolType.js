import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const SchoolTypeViz = ({ data, width = 300, height = 190, selectedSchoolTypes, updateSchoolType }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !data.length) return;

    
    const schoolTypeCounts = d3.rollup(
      data,
      v => v.length,
      d => d.School_Type
    );

    const totalCount = d3.sum([...schoolTypeCounts.values()]);
    
    const publicCount = schoolTypeCounts.get('Public') || 0;
    const privateCount = schoolTypeCounts.get('Private') || 0;
    
    const publicPercentage = (publicCount / totalCount) * 100;
    const privatePercentage = (privateCount / totalCount) * 100;

    
    d3.select(svgRef.current).selectAll('*').remove();

    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', '0 0 400 200')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('overflow', 'visible');
    
      
    const publicGradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'public-gradient')
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '0%')
      .attr('y2', '100%');

    publicGradient.append('stop')
      .attr('offset', `0%`)
      .attr('stop-color', '#ccc');

    publicGradient.append('stop')
      .attr('offset', `${100-publicPercentage}%`)
      .attr('stop-color', '#ccc');

    publicGradient.append('stop')
      .attr('offset', `${100-publicPercentage}%`)
      .attr('stop-color','#4682B4');

    publicGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color','#4682B4');

   
    const privateGradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'private-gradient')
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '0%')
      .attr('y2', '100%');

    privateGradient.append('stop')
      .attr('offset', `0%`)
      .attr('stop-color', '#ccc');

    privateGradient.append('stop')
      .attr('offset', `${100-privatePercentage}%`)
      .attr('stop-color', '#ccc');

    privateGradient.append('stop')
      .attr('offset', `${100-privatePercentage}%`)
      .attr('stop-color', '#FF69B4');

    privateGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#FF69B4');
    
    svg
      .append("text")
      .attr("x", 230)
      .attr("y", 5) 
      .attr("text-anchor", "middle")
      .attr("font-size", 18)
      .attr("font-weight", "bold")
      .text("School Type");

    
    const publicGroup = svg.append('g')
      .attr('transform', `translate(60, 10)`)
      .style('cursor', 'pointer')
      .on('click', () => {
        if (selectedSchoolTypes.includes("Public")) {
      updateSchoolType(selectedSchoolTypes.filter((g) => g !== "Public"));
    } else {
      updateSchoolType([...selectedSchoolTypes, "Public"]);
    }
      });

    const privateGroup = svg.append('g')
      .attr('transform', `translate(250, 10)`)
      .style('cursor', 'pointer')
      .on('click', () => {
         if (selectedSchoolTypes.includes("Private")) {
      updateSchoolType(selectedSchoolTypes.filter((g) => g !== "Private"));
    } else {
      updateSchoolType([...selectedSchoolTypes, "Private"]);
    }
      });

    
    const publicSchool = publicGroup.append('g')
      .attr('transform', 'scale(1.5)')
      .style('fill', 'url(#public-gradient)')
      .style('stroke', 'black')
      .style('stroke-width', '0.5');

    publicSchool.html(`
      <path d="M10.924,88c-0.553,0-1,0.447-1,1s0.447,1,1,1h78.399c0.553,0,1-0.447,1-1s-0.447-1-1-1h-3.155v-4.554  c2.256-0.464,3.957-2.465,3.957-4.855c0-2.733-2.224-4.958-4.957-4.958s-4.958,2.225-4.958,4.958c0,2.391,1.702,4.392,3.958,4.855  V88h-5.755V45.409c0-0.553-0.447-1-1-1H67.365V32.002c0-0.326-0.159-0.632-0.427-0.819l-15.714-11v-2.826h6.58c0.553,0,1-0.447,1-1  V11c0-0.553-0.447-1-1-1h-7.58c-0.553,0-1,0.447-1,1v9.179l-15.911,11c-0.271,0.187-0.432,0.494-0.432,0.822v12.407H22.834  c-0.553,0-1,0.447-1,1V88h-5.953v-4.554c2.256-0.464,3.958-2.465,3.958-4.855c0-2.733-2.225-4.958-4.958-4.958  s-4.957,2.225-4.957,4.958c0,2.391,1.701,4.392,3.957,4.855V88H10.924z M82.21,78.591c0-1.631,1.327-2.958,2.958-2.958  s2.957,1.327,2.957,2.958s-1.326,2.957-2.957,2.957S82.21,80.222,82.21,78.591z M11.924,78.591c0-1.631,1.326-2.958,2.957-2.958  s2.958,1.327,2.958,2.958s-1.327,2.957-2.958,2.957S11.924,80.222,11.924,78.591z M58.22,88h-6.995V70.361h6.995V88z M49.225,88  h-7.197V70.361h7.197V88z M56.805,15.356h-5.58V12h5.58V15.356z M23.834,46.409h10.048c0.553,0,1-0.447,1-1V32.526l15.339-10.605  l15.145,10.602v12.887c0,0.553,0.447,1,1,1h10.048V88H60.22V69.361c0-0.553-0.447-1-1-1H41.027c-0.553,0-1,0.447-1,1V88H23.834  V46.409z"/>
      <path d="M35.839,54.61h-7.175c-0.553,0-1,0.447-1,1v7.475c0,0.553,0.447,1,1,1h7.175c0.553,0,1-0.447,1-1V55.61  C36.839,55.058,36.392,54.61,35.839,54.61z M34.839,62.085h-5.175V56.61h5.175V62.085z"/>
      <path d="M41.027,64.085h7.174c0.553,0,1-0.447,1-1V55.61c0-0.553-0.447-1-1-1h-7.174c-0.553,0-1,0.447-1,1v7.475  C40.027,63.638,40.475,64.085,41.027,64.085z M42.027,56.61h5.174v5.475h-5.174V56.61z"/>
      <path d="M51.046,55.459v7.475c0,0.553,0.447,1,1,1h7.174c0.553,0,1-0.447,1-1v-7.475c0-0.553-0.447-1-1-1h-7.174  C51.493,54.459,51.046,54.906,51.046,55.459z M53.046,56.459h5.174v5.475h-5.174V56.459z"/>
      <path d="M64.512,64.085h7.174c0.553,0,1-0.447,1-1V55.61c0-0.553-0.447-1-1-1h-7.174c-0.553,0-1,0.447-1,1v7.475  C63.512,63.638,63.959,64.085,64.512,64.085z M65.512,56.61h5.174v5.475h-5.174V56.61z"/>
      <path d="M35.839,68.441h-7.175c-0.553,0-1,0.447-1,1v7.475c0,0.553,0.447,1,1,1h7.175c0.553,0,1-0.447,1-1v-7.475  C36.839,68.889,36.392,68.441,35.839,68.441z M34.839,75.916h-5.175v-5.475h5.175V75.916z"/>
      <path d="M64.512,77.916h7.174c0.553,0,1-0.447,1-1v-7.475c0-0.553-0.447-1-1-1h-7.174c-0.553,0-1,0.447-1,1v7.475  C63.512,77.469,63.959,77.916,64.512,77.916z M65.512,70.441h5.174v5.475h-5.174V70.441z"/>
      <path d="M50.123,48.038c4.422,0,8.019-3.597,8.019-8.018c0-4.422-3.597-8.019-8.019-8.019c-4.421,0-8.018,3.597-8.018,8.019  C42.105,44.441,45.702,48.038,50.123,48.038z M50.123,34.002c3.318,0,6.019,2.7,6.019,6.019s-2.7,6.018-6.019,6.018  s-6.018-2.699-6.018-6.018S46.805,34.002,50.123,34.002z"/>
      <path d="M50.216,41.389h3.799c0.553,0,1-0.447,1-1s-0.447-1-1-1h-2.799v-3.041c0-0.553-0.447-1-1-1s-1,0.447-1,1v4.041  C49.216,40.941,49.663,41.389,50.216,41.389z"/>
    `);

   
    const privateSchool = privateGroup.append('g')
      .attr('transform', 'scale(2.5)')
      .style('fill', 'url(#private-gradient)')
      .style('stroke', 'black')
      .style('stroke-width', '0.5');

    privateSchool.html(`
      <g>
        <g>
          <path d="M63,27v-4c0-0.553-0.448-1-1-1H26v-5c0.552,0,1-0.447,1-1v-4c0-0.553-0.448-1-1-1H8c-0.552,0-1,0.447-1,1v4    c0,0.553,0.448,1,1,1v5H2c-0.552,0-1,0.447-1,1v4c0,0.553,0.448,1,1,1v23H1v2h62v-2h-1V28C62.552,28,63,27.553,63,27z M61,24v2H26    v-2H61z M9,13h16v2H9V13z M24,17v34h-2v-7c0-2.757-2.243-5-5-5s-5,2.243-5,5v7h-2V17H24z M16,51h-2v-7    c0-1.302,0.839-2.402,2-2.816V51z M18,41.184c1.161,0.414,2,1.514,2,2.816v7h-2V41.184z M3,24h5v2H3V24z M4,28h4v23H4V28z M60,51    H26V28h34V51z"/>
          <path d="M17,28c-0.551,0-1-0.448-1-1h-2c0,1.302,0.839,2.402,2,2.816V31h2v-1.184c1.161-0.414,2-1.514,2-2.816    c0-1.654-1.346-3-3-3c-0.551,0-1-0.448-1-1s0.449-1,1-1s1,0.448,1,1h2c0-1.302-0.839-2.402-2-2.816V19h-2v1.184    c-1.161,0.414-2,1.514-2,2.816c0,1.654,1.346,3,3,3c0.551,0,1,0.448,1,1S17.551,28,17,28z"/>
          <path d="M29,48h4c0.552,0,1-0.447,1-1v-4c0-1.654-1.346-3-3-3s-3,1.346-3,3v4C28,47.553,28.448,48,29,48z M30,43    c0-0.552,0.449-1,1-1s1,0.448,1,1v3h-2V43z"/>
          <path d="M37,48h4c0.552,0,1-0.447,1-1v-4c0-1.654-1.346-3-3-3s-3,1.346-3,3v4C36,47.553,36.448,48,37,48z M38,43    c0-0.552,0.449-1,1-1s1,0.448,1,1v3h-2V43z"/>
          <path d="M45,48h4c0.552,0,1-0.447,1-1v-4c0-1.654-1.346-3-3-3s-3,1.346-3,3v4C44,47.553,44.448,48,45,48z M46,43    c0-0.552,0.449-1,1-1s1,0.448,1,1v3h-2V43z"/>
          <path d="M53,48h4c0.552,0,1-0.447,1-1v-4c0-1.654-1.346-3-3-3s-3,1.346-3,3v4C52,47.553,52.448,48,53,48z M54,43    c0-0.552,0.449-1,1-1s1,0.448,1,1v3h-2V43z"/>
          <path d="M29,38h4c0.552,0,1-0.447,1-1v-4c0-1.654-1.346-3-3-3s-3,1.346-3,3v4C28,37.553,28.448,38,29,38z M30,33    c0-0.552,0.449-1,1-1s1,0.448,1,1v3h-2V33z"/>
          <path d="M37,38h4c0.552,0,1-0.447,1-1v-4c0-1.654-1.346-3-3-3s-3,1.346-3,3v4C36,37.553,36.448,38,37,38z M38,33    c0-0.552,0.449-1,1-1s1,0.448,1,1v3h-2V33z"/>
          <path d="M45,38h4c0.552,0,1-0.447,1-1v-4c0-1.654-1.346-3-3-3s-3,1.346-3,3v4C44,37.553,44.448,38,45,38z M46,33    c0-0.552,0.449-1,1-1s1,0.448,1,1v3h-2V33z"/>
          <path d="M53,38h4c0.552,0,1-0.447,1-1v-4c0-1.654-1.346-3-3-3s-3,1.346-3,3v4C52,37.553,52.448,38,53,38z M54,33    c0-0.552,0.449-1,1-1s1,0.448,1,1v3h-2V33z"/>
        </g>
      </g>
    `);

    
    publicGroup.append('text')
      .attr('x', 70)
      .attr('y', 180)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`${Math.round(publicPercentage)}%`);

    privateGroup.append('text')
      .attr('x', 70)
      .attr('y', 180)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`${Math.round(privatePercentage)}%`);


    publicGroup.append('text')
      .attr('x', 70)
      .attr('y', 160)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('Public');

    privateGroup.append('text')
      .attr('x', 70)
      .attr('y', 160)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('Private');

    
    publicGroup.on('mouseover', function() {
      d3.select(this).style('opacity', 0.8);
    }).on('mouseout', function() {
      d3.select(this).style('opacity', 1);
    });

    privateGroup.on('mouseover', function() {
      d3.select(this).style('opacity', 0.8);
    }).on('mouseout', function() {
      d3.select(this).style('opacity', 1);
    });

  }, [data, width, height, selectedSchoolTypes, updateSchoolType]);

  return <svg ref={svgRef}></svg>;
};

export default SchoolTypeViz;
