"use client"

import { useState } from "react";

import Histogram from '../components/histogram';
import HorizontalBarChart from '../components/horizontalBarChart'
import Gender from '../components/gender';
import PCPPlot from '../components/PCPPlot';
import LinePlot from '../components/linePlot';
import ScatterPlot from '../components/scatterPlot';
import RadarPlot from '../components/radarPlot';


export default function Home() {
  const [order,setOrder]=useState(['Hours_Studied','Attendance','Parental_Involvement', 'Access_to_Resources','Extracurricular_Activities','Sleep_Hours','Previous_Scores','Motivation_Level','Internet_Access','Tutoring_Sessions','Family_Income','Teacher_Quality','School_Type','Peer_Influence','Physical_Activity','Learning_Disabilities','Parental_Education_Level','Distance_from_Home','Gender','Exam_Score']);
  const corder = ['Hours_Studied','Attendance','Parental_Involvement', 'Access_to_Resources','Extracurricular_Activities','Sleep_Hours','Previous_Scores','Motivation_Level','Internet_Access','Tutoring_Sessions','Family_Income','Teacher_Quality','School_Type','Peer_Influence','Physical_Activity','Learning_Disabilities','Parental_Education_Level','Distance_from_Home','Gender','Exam_Score'];

  const BarchartVariables= ['Parental_Involvement','Access_to_Resources','Motivation_Level','Family_Income','Teacher_Quality','Parental_Education_Level', 'Distance_from_Home'];

  const numericFeatures = ['Hours_Studied', 'Attendance', 'Sleep_Hours', 'Previous_Scores', 'Tutoring_Sessions','Physical_Activity', 'Exam_Score'];

  const handleOrder = (value: []) => {
    setOrder(value);
    console.log(order);
  };

  return (
    <div className="bg-white text-black">
    <h1>Student Performance Histogram</h1>
     <Histogram />
     <HorizontalBarChart variables={BarchartVariables}/>
     <Gender/>
     <PCPPlot order={order} setOrder={handleOrder}/>
     <LinePlot/>
     <ScatterPlot numericFeatures={numericFeatures}/>
     <RadarPlot initialFeatures={['Hours_Studied','Attendance','Sleep_Hours', 'Previous_Scores']}/>
  </div>
  );
}
