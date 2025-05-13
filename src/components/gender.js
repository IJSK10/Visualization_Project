"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

const GenderDistribution = ({
  data,
  gender,
  updateGender,
  width = 150,
  height = 200,
}) => {
  const svgRef = useRef();

  const handleMaleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (gender.includes("Male")) {
      updateGender(gender.filter((g) => g !== "Male"));
    } else {
      updateGender([...gender, "Male"]);
    }
  };
  const handleFemaleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (gender.includes("Female")) {
      updateGender(gender.filter((g) => g !== "Female"));
    } else {
      updateGender([...gender, "Female"]);
    }
  };

  useEffect(() => {
    if (!data || !data.length) return;

    const genderCounts = d3.rollup(
      data,
      (v) => v.length,
      (d) => d.Gender
    );
    const maleCount = genderCounts.get("Male") || 0;
    const femaleCount = genderCounts.get("Female") || 0;
    const total = maleCount + femaleCount;
    const malePct = total ? Math.round((maleCount / total) * 100) : 0;
    const femalePct = total ? Math.round((femaleCount / total) * 100) : 0;

    drawSvg(malePct, femalePct);
  }, [data, gender, width, height]);

  function drawSvg(malePct, femalePct) {
    d3.select(svgRef.current).selectAll("*").remove();

    const adjustedHeight = height * 1.60;
    const titlePad = 28;

    const svg = d3
      .select(svgRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", adjustedHeight);

    svg
      .append("text")
      .attr("x", width / 2 - 5)
      .attr("y", titlePad - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", 0.08 * width)
      .attr("font-weight", "bold")
      .text("Gender Distribution");

    const figX = 0.12 * width;
    const figY = titlePad;
    const figWidth = width * 0.75 * 0.9;
    const figHeight = adjustedHeight - titlePad - 16;

    const scaleX = d3
      .scaleLinear()
      .domain([0, 64])
      .range([figX, figX + figWidth]);
    const scaleY = d3
      .scaleLinear()
      .domain([0, 128])
      .range([figY, figY + figHeight]);

    const defs = svg.append("defs");
    defs
      .append("clipPath")
      .attr("id", "maleClip")
      .append("rect")
      .attr("x", scaleX(0))
      .attr("y", scaleY(128 - (128 * malePct) / 100))
      .attr("width", scaleX(32) - scaleX(0))
      .attr("height", scaleY((128 * malePct) / 100) - scaleY(0));

    defs
      .append("clipPath")
      .attr("id", "femaleClip")
      .append("rect")
      .attr("x", scaleX(32))
      .attr("y", scaleY(128 - (128 * femalePct) / 100))
      .attr("width", scaleX(64) - scaleX(32))
      .attr("height", scaleY((128 * femalePct) / 100) - scaleY(0));

    const maleFill =
      gender.length === 0 || gender.includes("Male") ? "deepskyblue" : "#ccc";
    const femaleFill =
      gender.length === 0 || gender.includes("Female") ? "hotpink" : "#ccc";

    const headRadius = (scaleX(40) - scaleX(32));
    svg
      .append("circle")
      .attr("cx", scaleX(32))
      .attr("cy", scaleY(16))
      .attr("r", headRadius * 1.6)
      .attr("fill", maleFill)
      .attr("clip-path", "url(#maleClip)");

    svg
      .append("circle")
      .attr("cx", scaleX(32))
      .attr("cy", scaleY(16))
      .attr("r", headRadius * 1.6)
      .attr("fill", femaleFill)
      .attr("clip-path", "url(#femaleClip)");

    svg
      .append("path")
      .attr(
        "d",
        `
        M${scaleX(20)} ${scaleY(28)} L${scaleX(20)} ${scaleY(128)} L${scaleX(24)} ${scaleY(128)} L${scaleX(28)} ${scaleY(60)} L${scaleX(28)} ${scaleY(28)} Z
      `
      )
      .attr("fill", maleFill)
      .attr("clip-path", "url(#maleClip)");
    svg
      .append("path")
      .attr(
        "d",
        `
        M${scaleX(14)} ${scaleY(40)} Q${scaleX(12)} ${scaleY(50)}, ${scaleX(14)} ${scaleY(70)}
        L${scaleX(18)} ${scaleY(70)} Q${scaleX(16)} ${scaleY(50)}, ${scaleX(18)} ${scaleY(40)} Z
      `
      )
      .attr("fill", maleFill)
      .attr("clip-path", "url(#maleClip)");

    svg
      .append("path")
      .attr(
        "d",
        `
        M${scaleX(32)} ${scaleY(28)} L${scaleX(36)} ${scaleY(40)} L${scaleX(48)} ${scaleY(80)} L${scaleX(36)} ${scaleY(80)}
        L${scaleX(40)} ${scaleY(128)} L${scaleX(34)} ${scaleY(128)} L${scaleX(32)} ${scaleY(80)} L${scaleX(32)} ${scaleY(60)} Z
      `
      )
      .attr("fill", femaleFill)
      .attr("clip-path", "url(#femaleClip)");
    svg
      .append("path")
      .attr(
        "d",
        `
        M${scaleX(50)} ${scaleY(40)} Q${scaleX(52)} ${scaleY(50)}, ${scaleX(50)} ${scaleY(70)}
        L${scaleX(46)} ${scaleY(70)} Q${scaleX(48)} ${scaleY(50)}, ${scaleX(46)} ${scaleY(40)} Z
      `
      )
      .attr("fill", femaleFill)
      .attr("clip-path", "url(#femaleClip)");
    svg
      .append("path")
      .attr(
        "d",
        `
        M${scaleX(32)} ${scaleY(60)} L${scaleX(32)} ${scaleY(80)} L${scaleX(34)} ${scaleY(80)}
        L${scaleX(34)} ${scaleY(128)} L${scaleX(40)} ${scaleY(128)} L${scaleX(40)} ${scaleY(80)} L${scaleX(48)} ${scaleY(80)} Z
      `
      )
      .attr("fill", femaleFill)
      .attr("clip-path", "url(#femaleClip)");

    svg
      .append("circle")
      .attr("cx", scaleX(32))
      .attr("cy", scaleY(16))
      .attr("r", headRadius * 1.6)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    svg
      .append("path")
      .attr(
        "d",
        `
        M${scaleX(20)} ${scaleY(28)} L${scaleX(20)} ${scaleY(128)} L${scaleX(24)} ${scaleY(128)} L${scaleX(28)} ${scaleY(60)} L${scaleX(28)} ${scaleY(28)} Z
      `
      )
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    svg
      .append("path")
      .attr(
        "d",
        `
        M${scaleX(14)} ${scaleY(40)} Q${scaleX(12)} ${scaleY(50)}, ${scaleX(14)} ${scaleY(70)}
        L${scaleX(18)} ${scaleY(70)} Q${scaleX(16)} ${scaleY(50)}, ${scaleX(18)} ${scaleY(40)} Z
      `
      )
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    svg
      .append("path")
      .attr(
        "d",
        `
        M${scaleX(32)} ${scaleY(28)} L${scaleX(36)} ${scaleY(40)} L${scaleX(48)} ${scaleY(80)} L${scaleX(36)} ${scaleY(80)}
        L${scaleX(40)} ${scaleY(128)} L${scaleX(34)} ${scaleY(128)} L${scaleX(32)} ${scaleY(80)} L${scaleX(32)} ${scaleY(60)} Z
      `
      )
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    svg
      .append("path")
      .attr(
        "d",
        `
        M${scaleX(50)} ${scaleY(40)} Q${scaleX(52)} ${scaleY(50)}, ${scaleX(50)} ${scaleY(70)}
        L${scaleX(46)} ${scaleY(70)} Q${scaleX(48)} ${scaleY(50)}, ${scaleX(46)} ${scaleY(40)} Z
      `
      )
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    svg
      .append("path")
      .attr(
        "d",
        `
        M${scaleX(32)} ${scaleY(60)} L${scaleX(32)} ${scaleY(80)} L${scaleX(34)} ${scaleY(80)}
        L${scaleX(34)} ${scaleY(128)} L${scaleX(40)} ${scaleY(128)} L${scaleX(40)} ${scaleY(80)} L${scaleX(48)} ${scaleY(80)} Z
      `
      )
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    svg
      .append("text")
      .attr("x", scaleX(6) - 5)
      .attr("y", scaleY(70))
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", maleFill)
      .attr("font-weight", "bold")
      .text(`${malePct}%`);

    svg
      .append("text")
      .attr("x", scaleX(58) + 5)
      .attr("y", scaleY(70))
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", femaleFill)
      .attr("font-weight", "bold")
      .text(`${femalePct}%`);

    svg
      .append("rect")
      .attr("x", scaleX(0))
      .attr("y", scaleY(0))
      .attr("width", scaleX(32) - scaleX(0))
      .attr("height", scaleY(128) - scaleY(0))
      .attr("fill", "transparent")
      .style("cursor", "pointer")
      .on("click", handleMaleClick)
      .on("mouseover", function () {
        d3.select(this).attr("fill", "rgba(0,0,0,0.05)");
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "transparent");
      });

    svg
      .append("rect")
      .attr("x", scaleX(32))
      .attr("y", scaleY(0))
      .attr("width", scaleX(64) - scaleX(32))
      .attr("height", scaleY(128) - scaleY(0))
      .attr("fill", "transparent")
      .style("cursor", "pointer")
      .on("click", handleFemaleClick)
      .on("mouseover", function () {
        d3.select(this).attr("fill", "rgba(0,0,0,0.05)");
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "transparent");
      });
  }

  return <div ref={svgRef} />;
};

export default GenderDistribution;
