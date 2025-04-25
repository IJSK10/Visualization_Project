"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

const GenderDistribution = () => {
  const svgRef = useRef();

  useEffect(() => {
    const fetchDataAndDraw = async () => {
      const response = await fetch("http://localhost:5001/data");
      const data = await response.json();

      const genderCounts = d3.rollup(
        data,
        v => v.length,
        d => d.Gender
      );
      const maleCount = genderCounts.get("Male") || 0;
      const femaleCount = genderCounts.get("Female") || 0;
      const total = maleCount + femaleCount;
      const malePct = total ? Math.round((maleCount / total) * 100) : 0;
      const femalePct = total ? Math.round((femaleCount / total) * 100) : 0;

      drawSvg(malePct, femalePct);
    };
    fetchDataAndDraw();
  }, []);

  function drawSvg(malePct, femalePct) {
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .append("svg")
      .attr("viewBox", "0 0 64 128")
      .attr("width", 150)
      .attr("height", 200);

    // --- CLIP PATHS ---
    const defs = svg.append("defs");
    // Male (left) percentage clip: fill up to percentage from bottom
    defs
      .append("clipPath")
      .attr("id", "maleClip")
      .append("rect")
      .attr("x", 0)
      .attr("y", 128 - (128 * malePct) / 100)
      .attr("width", 32)
      .attr("height", (128 * malePct) / 100);

    // Female (right) percentage clip: fill up to percentage from bottom
    defs
      .append("clipPath")
      .attr("id", "femaleClip")
      .append("rect")
      .attr("x", 32)
      .attr("y", 128 - (128 * femalePct) / 100)
      .attr("width", 32)
      .attr("height", (128 * femalePct) / 100);

    // --- FIGURE FILLS ---
    // Head - Left (Blue)
    svg
      .append("circle")
      .attr("cx", 32)
      .attr("cy", 16)
      .attr("r", 12)
      .attr("fill", "deepskyblue")
      .attr("clip-path", "url(#maleClip)");

    // Head - Right (Pink)
    svg
      .append("circle")
      .attr("cx", 32)
      .attr("cy", 16)
      .attr("r", 12)
      .attr("fill", "hotpink")
      .attr("clip-path", "url(#femaleClip)");

    // Male half (left side with straight torso and connected arm)
    svg
      .append("path")
      .attr("d", "M20 28 L20 128 L24 128 L28 60 L28 28 Z")
      .attr("fill", "deepskyblue")
      .attr("clip-path", "url(#maleClip)");
    // Male Arm (connected)
    svg
      .append("path")
      .attr("d", "M14 40 Q12 50, 14 70 L18 70 Q16 50, 18 40 Z")
      .attr("fill", "deepskyblue")
      .attr("clip-path", "url(#maleClip)");

    // Female half (right side with skirt and connected arm)
    svg
      .append("path")
      .attr(
        "d",
        "M32 28 L36 40 L48 80 L36 80 L40 128 L34 128 L32 80 L32 60 Z"
      )
      .attr("fill", "hotpink")
      .attr("clip-path", "url(#femaleClip)");
    // Female Arm (connected)
    svg
      .append("path")
      .attr("d", "M50 40 Q52 50, 50 70 L46 70 Q48 50, 46 40 Z")
      .attr("fill", "hotpink")
      .attr("clip-path", "url(#femaleClip)");
    // Fixing the white gaps in the female body (adding a pink section)
    svg
      .append("path")
      .attr(
        "d",
        "M32 60 L32 80 L34 80 L34 128 L40 128 L40 80 L48 80 Z"
      )
      .attr("fill", "hotpink")
      .attr("clip-path", "url(#femaleClip)");

    // --- OUTLINE (always visible, black) ---
    svg
      .append("circle")
      .attr("cx", 32)
      .attr("cy", 16)
      .attr("r", 12)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    svg
      .append("path")
      .attr("d", "M20 28 L20 128 L24 128 L28 60 L28 28 Z")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    svg
      .append("path")
      .attr("d", "M14 40 Q12 50, 14 70 L18 70 Q16 50, 18 40 Z")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    svg
      .append("path")
      .attr(
        "d",
        "M32 28 L36 40 L48 80 L36 80 L40 128 L34 128 L32 80 L32 60 Z"
      )
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    svg
      .append("path")
      .attr("d", "M50 40 Q52 50, 50 70 L46 70 Q48 50, 46 40 Z")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    svg
      .append("path")
      .attr(
        "d",
        "M32 60 L32 80 L34 80 L34 128 L40 128 L40 80 L48 80 Z"
      )
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    // --- PERCENTAGE LABELS ---
    svg
      .append("text")
      .attr("x", 6)
      .attr("y", 70)
      .attr("text-anchor", "middle")
      .attr("font-size", "5px")
      .attr("fill", "deepskyblue")
      .attr("font-weight", "bold")
      .text(`${malePct}%`);

    svg
      .append("text")
      .attr("x", 58)
      .attr("y", 70)
      .attr("text-anchor", "middle")
      .attr("font-size", "5px")
      .attr("fill", "hotpink")
      .attr("font-weight", "bold")
      .text(`${femalePct}%`);
  }

  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Gender Distribution</h3>
      <div ref={svgRef}></div>
    </div>
  );
};

export default GenderDistribution;
