import '../getStartedButton.css';
import React, { useState, useRef, useLayoutEffect } from 'react';
import Draggable from 'react-draggable';
import './VideoPlayer.css';
import {Database, BarChart3, FileText, Rocket, Users, Zap  } from 'lucide-react';
import { useUser,SignIn } from "@clerk/clerk-react";
import bg1 from '../assets/bg4.png';
import { BorderBeam } from "../components/lightswind/border-beam"
import bgCleaning from '../assets/fc1.png';
import bgTraining from '../assets/fc2.png';
import bgVisualization from '../assets/fc3.png';
import { SparkleParticles } from '@/components/lightswind/sparkle-particles';
import heroVideo from '../assets/herosection.mp4';

import yourLeftSideImage from '../assets/fs.png';
import BoomerangVideo from './BoomerangVideo';
const HomePage = ({setActivePage }) => {
  const { isSignedIn } = useUser();
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const nodeRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const leftImageRef = useRef(null);
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const card3Ref = useRef(null);

  const [pathD, setPathD] = useState({ path1: '', path2: '', path3: '' });
  const [hoveredCard, setHoveredCard] = useState(null);

  useLayoutEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      calculatePaths();
    };

    const calculatePaths = () => {
      if (isMobile) {
        setPathD({ path1: '', path2: '', path3: '' });
        return;
      }
      const container = document.getElementById('features-visual-container');

      if (container && leftImageRef.current && card1Ref.current && card2Ref.current && card3Ref.current) {
        const containerRect = container.getBoundingClientRect();

        const leftRect = leftImageRef.current.getBoundingClientRect();
        const card1Rect = card1Ref.current.getBoundingClientRect();
        const card2Rect = card2Ref.current.getBoundingClientRect();
        const card3Rect = card3Ref.current.getBoundingClientRect();

        const startX = leftRect.right - containerRect.left;
        const startY = leftRect.top + leftRect.height / 2 - containerRect.top;

        const createPath = (endRect) => {
          const endX = endRect.left - containerRect.left;
          const endY = endRect.top + endRect.height / 2 - containerRect.top;
          const controlPoint1X = startX + (endX - startX) * 0.3; // Closer to start
          const controlPoint1Y = startY;
          const controlPoint2X = startX + (endX - startX) * 0.7; // Closer to end
          const controlPoint2Y = endY;

          return `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;
        };


        setPathD({
          path1: createPath(card1Rect),
          path2: createPath(card2Rect),
          path3: createPath(card3Rect),
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);


  const openVideoPlayer = () => setIsVideoPlayerOpen(true);
  const closeVideoPlayer = () => setIsVideoPlayerOpen(false);

const LightningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-cyan-400"
  >
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
const DataCleaningIcon = () => (
    <svg className="w-8 h-8 text-white mr-3 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
);



const cardData = [
    {
        id: 1,
        title: "Data Cleaning",
        description: "Automatically clean and prepare your data with intelligent preprocessing tools that handle missing values, duplicates, and inconsistencies.",
        icon: <DataCleaningIcon />,
        backgroundImageUrl: bgCleaning,
        shadow: "shadow-blue-900/50",
        position: "md:absolute md:top-0",
        zIndex: "z-30",
        ref: card1Ref,
        color: "#EF4480" 
    },
    {
        id: 2,
        title: "Smart Analysis",
        description: "Leverage AI-powered analytics to uncover hidden patterns, trends, and insights in your data with natural language queries.",
        icon: <BarChart3 className="w-8 h-8 text-white mr-3 shrink-0" />,
        backgroundImageUrl: bgTraining,
        shadow: "shadow-teal-900/50",
        position: "md:absolute md:top-24",
        zIndex: "z-20",
        ref: card2Ref,
        color: "#60D3FF" 
    },
    {
        id: 3,
        title: "Visualization",
        description: "Generate comprehensive, professional reports with visualizations and insights that tell the story of your data.",
        icon: <FileText className="w-8 h-8 text-white mr-3 shrink-0" />,
        backgroundImageUrl: bgVisualization,
        shadow: "shadow-purple-900/50",
        position: "md:absolute md:top-48",
        zIndex: "z-10",
        ref: card3Ref,
        color: "rgba(122, 118, 255, 1)"
    }
];

const Card = React.forwardRef(({ id, title, description, icon, backgroundImageUrl, shadow, position, zIndex, onMouseEnter, onMouseLeave,color }, ref) => {
    const cardClasses = `
        group w-full sm:w-80 h-24 mb-4 md:h-13 md:pb-4 md:hover:h-[410px]
        bg-cover bg-center rounded-4xl shadow-2xl ${shadow}
        overflow-hidden transition-all duration-500 ease-in-out
        md:hover:z-50 md:hover:-translate-y-[170px] border border-white-500/60 outline-2 outline-offset-4 outline-dashed outline-white
        ${position} ${zIndex}
    `;

    return (
        <div
            ref={ref}
            className={cardClasses.trim()}
            style={{ backgroundImage: `url(${backgroundImageUrl})`, borderColor: color }}
            onMouseEnter={() => onMouseEnter(id)}
            onMouseLeave={() => onMouseLeave(null)}
        >

            <div className="relative w-full h-full flex items-center justify-center md:block">
                <div className="md:absolute left-1/2 -translate-x-1/2 top-1/2 pt-5 -translate-y-1/2 w-max flex items-center justify-center transition-all duration-500 ease-in-out md:group-hover:top-48 md:group-hover:-translate-y-0">
                    {icon}
                    <h2 className="text-xl font-medium text-white whitespace-nowrap">{title}</h2>
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-center transition-all duration-500 ease-in-out opacity-0 group-hover:opacity-100 group-hover:bottom">
                        <p className="text-white text-md font-light">
                            {description}
                        </p>
                </div>
            </div>
        </div>
    );
});

  const handleButtonClick = () => {
    if (isSignedIn) {
      setActivePage('cleaning');
    } else {
      alert("Whoa there! Looks like you're trying to get to the good stuff. You'll need to log in first to unlock the magic.");
    }
  };


  return (
    <div className="antialiased">

      {isVideoPlayerOpen && (
  <Draggable nodeRef={nodeRef} handle=".video-player-header">

    <div
      ref={nodeRef}
  className="video-player-overlay w-3/4 sm:w-1/2 md:w-1/3 h-auto rounded-lg overflow-hidden shadow-lg bg-black"
    >
      <div className="video-player-header flex justify-between items-center p-2 bg-gray-800 text-white">
        <h3 className="text-xl">Analytica.ai Demo</h3>
        <button
          onClick={closeVideoPlayer}
          className="video-player-close-btn text-xl"
        >
          &times;
        </button>
      </div>

      <div className="video-player-content w-full h-full">
        <iframe
          className="w-full h-full"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay;  encrypted-media; gyroscope;"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  </Draggable>
)}


      <BorderBeam
  size={200}
  duration={6}
  delay={0}
  colorFrom="#22c55e"
  colorTo="#1070b9ff"
  reverse={false}
  initialOffset={0}
  borderThickness={2}
  opacity={1}
  glowIntensity={8}
  beamBorderRadius={45}
  pauseOnHover={false}
  speedMultiplier={1}
/>
<main
  className="relative flex items-center p-4 sm:px-6 lg:px-8"
  style={{
    backgroundImage: `url(${bg1})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
  }}
>
<SparkleParticles
  className="absolute inset-0 z-0"
  maxParticleSize={1.5}
  minParticleSize={0.8}
  baseDensity={100}
  maxSpeed={2}
  minMoveSpeed={0.2}
  maxOpacity={0.8}
  customDirection="bottomLeft"
  opacityAnimationSpeed={5}
  minParticleOpacity={0.2}
  particleColor="#00ffcc"
  enableParallax={true}
  enableHoverGrab={false}
  backgroundColor="transparent"
  zIndexLevel={-1}
  clickEffect={true}
  hoverMode="repulse"
  particleCount={6}
  particleShape="star"
  enableCollisions={true}
/>
  <div className="flex flex-col md:flex-row max-w-8xl mx-auto items-center">
    {/* Left Side: Text Content */}

    <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0 md:pr-10">
      <div className="content-wrapper text-white pt-18">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-200 mb-6 leading-tight pt-10" >
          Turn Your Data Into{' '}
          <span className="text-[#644bfc]">Dialogue</span>.
        </h1>
        <div className="inline-flex items-center px-6 py-3 glass-badge rounded-full mb-8 animate-fade-in">
          <span className="text-sm font-medium text-white/90 tracking-wide">
            ✨ Welcome to Analytica.ai
          </span>
        </div>
        <p className="text-lg sm:text-xl text-gray-400 mb-8 leading-relaxed max-w-2xl mx-auto md:mx-0">
          Turn raw data into insights with our AI-powered visualization
          platform. Clean, analyze, and report effortlessly.
        </p>
        <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-6">
          <div className="relative group">
            <button
              style={{ fontFamily: "'Orbitron', sans-serif" }}
              onClick={handleButtonClick}
              className="relative p-0.5 rounded-full bg-gradient-to-tr from-cyan-700 via-sky-800 to-indigo-900 shadow-lg shadow-sky-950/50 transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-cyan-700/40 hover:scale-105 active:scale-100 w-full sm:w-auto"
            >
              <span className="relative block px-8 py-3 overflow-hidden font-bold text-white uppercase rounded-full bg-[#0f172a] leading-none">
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(0deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[length:2rem_2rem] bg-center"></span>
                <span className="relative z-10 inline-flex items-center justify-center w-full sm:w-auto">
                  <span className="transition-transform duration-300 ease-in-out group-hover:translate-x-2">
                    Get Started
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 ml-2 text-transparent transition-all duration-300 ease-in-out transform -translate-x-5 group-hover:text-cyan-400 group-hover:translate-x-0"
                  >
                    <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"></path>
                  </svg>
                </span>
              </span>
            </button>
          </div>
          <button
            onClick={openVideoPlayer}
            className="group flex items-center justify-center gap-3 bg-black/50 text-white/90 border border-white/10 rounded-full px-6 py-3 transition-all duration-300 hover:border-white/20 hover:bg-black/70 active:scale-95 w-full sm:w-auto"
          >
            <svg
              className="w-6 h-6 text-white/70 group-hover:text-white transition-colors duration-300"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"></path>
            </svg>
            <span className="text-lg font-medium">Watch Demo</span>
          </button>
        </div>
      </div>
    </div>

    {/* Right Side: Video Player */}
    <div className="md:w-1/2 z-10 pt-10 md:pt-30 rounded-3xl w-full">
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl shadow-blue-400/90">
        <video
          className="w-full h-full object-cover"
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
        ></video>
      </div>
    </div>
  </div>
</main>

 <section className="bg-black relative overflow-hidden pb-20" style={{ minHeight: '60vh' }}>
<BoomerangVideo />

  {/* SECTION 1: */}
  {/* ==================================================================== */}
  <div className="max-w-6xl mx-auto relative mt-20 pb-12" style={{ zIndex: 1 }}>
    <div className="relative text-center z-10 px-4"> {/* Added padding for mobile */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center gap-2 px-4 py-1 bg-gray-800/50 border border-gray-700 rounded-full">
          <LightningIcon />
          <span className="text-lg font-medium text-gray-300">Powerful Features</span>
        </div>
      </div>
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
        Everything You Need for
        <br />
        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Data Excellence
        </span>
      </h2>
      <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-300 mb-16">
        Transform your data workflow with cutting-edge AI technology. From cleaning to insights, we've got you covered.
      </p>
    </div>
  </div>

  {/* ==================================================================== */}
  {/* SECTION 2:*/}
 
  <div id="features-visual-container" className="relative w-full px-4 sm:px-8 lg:px-12">
    {/* Main flex container*/}
    <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
      {/* Left side with image */}
      <div className="md:w-1/2 flex justify-center items-center">
        <img
          ref={leftImageRef}
          src={yourLeftSideImage}
          alt="Left side illustration"
          className="w-full h-auto max-w-xl z-10"
        />
      </div>

      {/* Right side with stacked cards */}
      <div className="md:w-1/2 flex flex-col items-center pt-8 md:pt-20">
        <div className="relative w-full md:w-80 md:h-96">
          {cardData.map(card => (
            <Card
              key={card.id}
              id={card.id}
              ref={card.ref}
              title={card.title}
              description={card.description}
              icon={card.icon}
              backgroundImageUrl={card.backgroundImageUrl}
              shadow={card.shadow}
              position={card.position}
              zIndex={card.zIndex}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              color={card.color}
            />
          ))}
        </div>
      </div>
    </div>

    {/* SVG for connecting lines */}
    {!isMobile && (
    <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
      <svg
        width="100%"
        height="100%"
        className="overflow-visible"
        style={{ transform: "translateX(0)" }}
      >
        <defs>
          <linearGradient id="default-line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8101f8ff" />
            <stop offset="100%" stopColor="#0062ffff" />
          </linearGradient>
        </defs>
        {cardData.map(card => (
          <path
            key={`path-${card.id}`}
            d={pathD[`path${card.id}`]}
            stroke={hoveredCard === card.id ? card.color : 'url(#default-line-gradient)'}
            strokeWidth="2"
            fill="none"
            opacity={hoveredCard === null || hoveredCard === card.id ? 1 : 0.3}
            className="transition-opacity duration-300 ease-in-out"
          />
        ))}
      </svg>
    </div>
    )}
  </div>

  {/* SECTION 3 */}
  {/* ==================================================================== */}
  <div className="relative text-center pt-20 md:pt-40 z-10">
    <div className="p-8 md:p-12 flex flex-col items-center text-center">
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
        Ready to Transform <br />
        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Your Data Journey?
        </span>
      </h2>
      <p className="mt-6 max-w-2xl text-lg text-gray-300">
        Join thousands of data professionals who trust Analytica.ai for their analytics needs. Start your journey today.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
        <button onClick={handleButtonClick} className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-full shadow-lg shadow-cyan-500/20 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 ease-in-out">
          <span>Start Your Journey</span>
          <Rocket/>
        </button>
        <p className="text-sm text-gray-400 mt-4 sm:mt-0">
          No credit card required • Free 14-day trial
        </p>
      </div>
    </div>
  </div>
</section>

    </div>
  );
};

export default HomePage;