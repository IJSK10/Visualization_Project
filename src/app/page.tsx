"use client"
import { useState, useEffect } from "react";
import Histogram from '../components/histogram';
import HorizontalBarChart from '../components/horizontalBarChart'
import Gender from '../components/gender';
import LinePlot from '../components/linePlot';
import ScatterPlot from '../components/scatterPlot';
import RadarPlot from '../components/radarPlot';
import SchoolPlot from '../components/schoolType';
import InternetPlot from '../components/internetPlot';



import Image from 'next/image'

export default function Home() {
  const [distanceFromHome, setDistanceFromHome] = useState([]);
  const [parentalEducationLevel, setParentalEducationLevel] = useState([]);
  const [teacherQuality, setTeacherQuality] = useState([]);
  const [familyIncome, setFamilyIncome] = useState([]);
  const [motivationLevel, setMotivationLevel] = useState([]);
  const [accessToResources, setAccessToResources] = useState([]);
  const [parentalInvolvement, setParentalInvolvement] = useState([]);
  const [learningDisabilities, setLearningDisabilities] = useState([]);
  const [peerInfluence, setPeerInfluence] = useState([]);
  const [extracurricularActivities, setExtracurricularActivities] = useState([]);
  const [selectedBins, setSelectedBins] = useState([]);
  const [gender, setGender] = useState([]);
  const [schoolType, setSchoolType] = useState([]);
  const [internetAccess, setInternetAccess] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const resetAllFilters = () => {
  setDistanceFromHome([]);
  setParentalEducationLevel([]);
  setTeacherQuality([]);
  setFamilyIncome([]);
  setMotivationLevel([]);
  setAccessToResources([]);
  setParentalInvolvement([]);
  setLearningDisabilities([]);
  setPeerInfluence([]);
  setExtracurricularActivities([]);
  setSelectedBins([]);
  setGender([]);
  setSchoolType([]);
  setInternetAccess([]);
  setSelectedIds([]);
};

  const BarchartVariables = [
    'Parental_Involvement',
    'Access_to_Resources',
    'Motivation_Level',
    'Family_Income',
    'Teacher_Quality',
    'Parental_Education_Level',
    'Distance_from_Home',
    'Learning_Disabilities',
    'Peer_Influence',
    'Extracurricular_Activities'
  ];

  const numericFeatures = [
    'Hours_Studied',
    'Attendance',
    'Sleep_Hours',
    'Previous_Scores',
    'Tutoring_Sessions',
    'Physical_Activity',
    'Exam_Score'
  ];

  const [queryParameter, setQueryParameter] = useState({});
  useEffect(() => {
    setQueryParameter({
      Distance_from_Home: distanceFromHome,
      Parental_Education_Level: parentalEducationLevel,
      Teacher_Quality: teacherQuality,
      Family_Income: familyIncome,
      Motivation_Level: motivationLevel,
      Access_to_Resources: accessToResources,
      Parental_Involvement: parentalInvolvement,
      Learning_Disabilities: learningDisabilities,
      Peer_Influence: peerInfluence,
      Extracurricular_Activities: extracurricularActivities,
      bin_id: selectedBins,
      Gender: gender,
      School_Type: schoolType,
      Internet_Access: internetAccess,
      ...(selectedIds.length > 0 && { id: selectedIds })
    });
  }, [
    distanceFromHome,
    parentalEducationLevel,
    teacherQuality,
    familyIncome,
    motivationLevel,
    accessToResources,
    parentalInvolvement,
    learningDisabilities,
    peerInfluence,
    extracurricularActivities,
    selectedBins,
    gender,
    schoolType,
    internetAccess,
    selectedIds
  ]);

  const [data, setData] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(queryParameter).forEach(([key, value]) => {
      if (Array.isArray(value)) value.forEach(v => params.append(key, v));
      else if (value !== undefined && value !== null) params.append(key, value);
    });
    const queryString = params.toString() ? `?${params.toString()}` : '';
    fetch(`http://127.0.0.1:5001/data${queryString}`)
      .then(res => res.json())
      .then(setData)
      .catch(err => setData([]));
  }, [queryParameter]);

  const updateDistanceFromHome = arr => setDistanceFromHome(arr);
  const updateParentalEducationLevel = arr => setParentalEducationLevel(arr);
  const updateTeacherQuality = arr => setTeacherQuality(arr);
  const updateFamilyIncome = arr => setFamilyIncome(arr);
  const updateMotivationLevel = arr => setMotivationLevel(arr);
  const updateAccessToResources = arr => setAccessToResources(arr);
  const updateParentalInvolvement = arr => setParentalInvolvement(arr);
  const updateLearningDisabilities = arr => setLearningDisabilities(arr);
  const updatePeerInfluence = arr => setPeerInfluence(arr);
  const updateExtracurricularActivities = arr => setExtracurricularActivities(arr);
  const updateSelectedBins = arr => setSelectedBins(arr);
  const updateGender = arr => setGender(arr);
  const updateSchoolType = arr => setSchoolType(arr);
  const updateInternetAccess = arr => setInternetAccess(arr);

  const handleScatterBrush = (selectedPoints) => {
    setSelectedIds(selectedPoints);
  };

  return (
    <div className="bg-white text-black" style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        left: '52%',
        top: 5,
        transform: 'translateX(-50%)',
        zIndex: 2,
        display: 'flex',
        justifyContent: 'center',
        width: '100%'
      }}>
        <Image
          className="pr-5"
          src="/book.png"
          alt="Description of image"
          width={60}
          height={20}
        />
        <h1 className="text-center text-2xl font-extrabold italic leading-8 text-[#8DD8FF] [-moz-text-fill-color:[#cc76a1]] [-moz-text-stroke:3px_#22031f] [-webkit-text-fill-color:[#cc76a1]] [-webkit-text-stroke:3px_#22031f] [paint-order:stroke_fill] [text-shadow:5px_10px_5px_#0000005e]">
            STUDENT PERFORMANCE DASHBOARD   
        </h1>
        <Image
          className="pl-5"
          src="/book.png"
          alt="Description of image"
          width={60}
          height={20}
        />
        <button
  onClick={resetAllFilters}
  style={{
    margin: '5px',
    marginLeft: '20px',
    background: '#EEEEEE',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    paddingLeft : '8px',
  }}
  aria-label="Reset all filters"
  title="Reset all filters"
>
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
  </svg>
</button>
      </div>

      <div style={{
        position: 'absolute', left: 20, top: 55, width: 380, height: 170, zIndex: 1,
        background: '#FFFDF6', borderRadius: 10, boxShadow: '0 2px 8px #0001'
      }}>
        <Histogram
          data={data}
          selectedBins={selectedBins}
          updateSelectedBins={updateSelectedBins}
        />
      </div>

      <div style={{
        position: 'absolute', left: 510, top: 400, width: 350, height: 320, zIndex: 1,
        background: '#FFFDF6', borderRadius: 10, boxShadow: '0 2px 8px #0001'
      }}>
        <RadarPlot
          initialFeatures={['Hours_Studied', 'Attendance', 'Sleep_Hours', 'Previous_Scores']}
          data={data}
        />
      </div>

      <div style={{
        position: 'absolute', left: 970, top: 55, width: 580, height: 670, zIndex: 1,
        background: '#FFFDF6', borderRadius: 10, boxShadow: '0 2px 8px #0001'
      }}>
        <HorizontalBarChart
          data={data}
          variables={BarchartVariables}
          distanceFromHome={distanceFromHome}
          updateDistanceFromHome={updateDistanceFromHome}
          parentalEducationLevel={parentalEducationLevel}
          updateParentalEducationLevel={updateParentalEducationLevel}
          teacherQuality={teacherQuality}
          updateTeacherQuality={updateTeacherQuality}
          familyIncome={familyIncome}
          updateFamilyIncome={updateFamilyIncome}
          motivationLevel={motivationLevel}
          updateMotivationLevel={updateMotivationLevel}
          accessToResources={accessToResources}
          updateAccessToResources={updateAccessToResources}
          parentalInvolvement={parentalInvolvement}
          updateParentalInvolvement={updateParentalInvolvement}
          learningDisabilities={learningDisabilities}
          updateLearningDisabilities={updateLearningDisabilities}
          peerInfluence={peerInfluence}
          updatePeerInfluence={updatePeerInfluence}
          extracurricularActivities={extracurricularActivities}
          updateExtracurricularActivities={updateExtracurricularActivities}
          selectedBins={selectedBins}
        />
      </div>

      <div style={{
        position: 'absolute', left: 20, top: 238, width: 380, height: 190, zIndex: 1,
        background: '#FFFDF6', borderRadius: 10, boxShadow: '0 2px 8px #0001'
      }}>
        <LinePlot data={data} />
      </div>

      <div style={{
        position: 'absolute', left: 425, top: 55, width: 130, height: 320, zIndex: 1,
        background: '#FFFDF6', borderRadius: 10, boxShadow: '0 2px 8px #0001'
      }}>
        <Gender
          data={data}
          gender={gender}
          updateGender={updateGender}
        />
      </div>

      <div style={{
        position: 'absolute', left: 25, top: 445, width: 370, height: 280, zIndex: 1,
        background: '#FFFDF6', borderRadius: 10, boxShadow: '0 2px 8px #0001'
      }}>
        <ScatterPlot
          data={data}
          numericFeatures={numericFeatures}
          onBrush={handleScatterBrush}
        />
      </div>

      <div style={{
        position: 'absolute', left: 580, top: 55, width: 370, height: 170, zIndex: 1,
        background: '#FFFDF6', borderRadius: 10, boxShadow: '0 2px 8px #0001'
      }}>
        <SchoolPlot
          data={data}
          selectedSchoolTypes={schoolType}
          updateSchoolType={updateSchoolType}
        />
      </div>

      <div style={{
        position: 'absolute', left: 580, top: 240, width: 370, height: 140, zIndex: 1,
        background: '#FFFDF6', borderRadius: 10, boxShadow: '0 2px 8px #0001'
      }}>
        <InternetPlot
          data={data}
          selectedInternetAccess={internetAccess}
          updateInternetAccess={updateInternetAccess}
        />
      </div>
    </div>
  );
}
