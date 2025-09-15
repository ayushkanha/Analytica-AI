import '../getStartedButton.css';
import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import './VideoPlayer.css';
import {Database, BarChart3, FileText, Rocket, Users, Zap  } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import { useUser,SignIn } from "@clerk/clerk-react";
import bg1 from '../assets/bg1.png';
import { ParticleNetwork } from '@/components/ParticleNetwork';
import { BorderBeam } from "@/components/lightswind/border-beam"
import Hyperspeed from './Hyperspeed';
import GlassSurface from './GlassSurface'
import ScrollFloat from './ScrollFloat';
import DarkVeil from './DarkVeil';
const HomePage = ({setActivePage }) => {
  const { isSignedIn } = useUser();
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const nodeRef = useRef(null);

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

  const handleButtonClick = () => {
    if (isSignedIn) {
      setActivePage('dashboard');
    } else {
      alert("Whoa there! Looks like you're trying to get to the good stuff. You'll need to log in first to unlock the magic.");
    }
  };
  const features = [
    {
      icon: Database,
      title: "Data Cleaning",
      description: "Automatically clean and prepare your data with intelligent preprocessing tools that handle missing values, duplicates, and inconsistencies."
    },
    {
      icon: BarChart3,
      title: "Smart Analysis",
      description: "Leverage AI-powered analytics to uncover hidden patterns, trends, and insights in your data with natural language queries."
    },
    {
      icon: FileText,
      title: "Automated Reports",
      description: "Generate comprehensive, professional reports with visualizations and insights that tell the story of your data."
    }
  ];

  return (
    <div className="antialiased">
      {isVideoPlayerOpen && (
        <Draggable nodeRef={nodeRef} handle=".video-player-header">
          <div ref={nodeRef} className="video-player-overlay">
            <div className="video-player-header">
              <h3>Analytica.ai Demo</h3>
              <button onClick={closeVideoPlayer} className="video-player-close-btn">&times;</button>
            </div>
            <div className="video-player-content">
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </Draggable>
      )}
      {/* Hero Section */}
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
      <main className="relative flex items-center justify-center p-4" style={{ backgroundImage: `url(${bg1})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh' }}>
      <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-black to-transparent z-10 blur-2xl" />
      <ParticleNetwork />
        <div className="content-wrapper text-center text-white pt-20">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-200 mb-6 leading-tight">
            Turn Your Data Into{' '}
            <span className="text-[#6aa2d8]">Dialogue</span>.
          </h1>
          <div className="inline-flex items-center px-6 py-3 glass-badge rounded-full mb-8 animate-fade-in">
          <span className="text-sm font-medium text-white/90 tracking-wide">✨ Welcome to Analytica.ai</span>
        </div>
          <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-2xl mx-auto">
            Turn raw data into insights with our AI-powered visualization platform. Clean, analyze, and report effortlessly.
          </p>

      <div className="flex items-center justify-center gap-6">
        <div className="relative group">
            <button 
      style={{ fontFamily: "'Orbitron', sans-serif" }}
      className="relative group p-0.5 rounded-full bg-gradient-to-tr from-cyan-700 via-sky-800 to-indigo-900 shadow-lg shadow-sky-950/50 transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-cyan-700/40 hover:scale-105 active:scale-100"
    >
      <span className="relative block px-8 py-3 overflow-hidden font-bold text-white uppercase rounded-full bg-[#0f172a] leading-none">
          
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(0deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[length:2rem_2rem] bg-center"></span>
          
          <span className="relative z-10 flex items-center">
              
              <span className="transition-transform duration-300 ease-in-out group-hover:translate-x-2">
                  Get Started
              </span>
              
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-2 text-cyan-400 opacity-0 -translate-x-5 transform transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-x-0">
                  <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"></path>
              </svg>
          </span>
      </span>
    </button>
        </div>

        <button onClick={openVideoPlayer} class="group flex items-center justify-center gap-3 bg-black/50 text-white/90 border border-white/10 rounded-full px-6 py-3 transition-all duration-300 hover:border-white/20 hover:bg-black/70 active:scale-95">
            <svg className="w-6 h-6 text-white/70 group-hover:text-white transition-colors duration-300" 
                 xmlns="http://www.w3.org/2000/svg" 
                 viewBox="0 0 24 24" 
                 fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"></path>
            </svg>
            
            <span class="text-lg font-medium">Watch Demo</span>
        </button>
    </div>

        </div>
        
      </main>

      


      {/* Features Section with Hyperspeed background */}
      <section className="bg-black relative overflow-hidden pb-20" style={{ minHeight: '60vh' }}>
        {/* Hyperspeed background */}
        <DarkVeil className="absolute inset-0 z-0" />
        <div className="max-w-6xl mx-auto relative mt-20 pb-12" style={{ zIndex: 1 }}>
          <div className="relative text-center z-10">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2 px-4 py-1 bg-gray-800/50 border border-gray-700 rounded-full">
            <LightningIcon />
            <span className="text-lg font-medium text-gray-300">Powerful Features</span>
          </div>
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
          <ScrollFloat as="span" containerClassName="my-0" textClassName="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Everything You Need for
          </ScrollFloat>
          <br />
          <ScrollFloat as="span" containerClassName="my-0" textClassName="text-4xl md:text-5xl lg:text-6xl font-extrabold ">

                          Data Excellence
            
          
          </ScrollFloat>
        </h2>
        
        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-300 mb-16">
          Transform your data workflow with cutting-edge AI technology. From cleaning to insights, we've got you covered.
        </p>
      </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      

        {/* <div className="max-w-4xl mx-auto text-center relative mt-16 "  style={{ zIndex: 2 }}>
          <h2 className="text-3xl font-bold text-gray-200 mb-4">
            Ready to Transform Your Data?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Join thousands of data professionals who trust AI Visualizer for their analytics needs.
          </p>
          <button 
            onClick={handleButtonClick}
            class="group relative bg-slate-900 h-16 w-64 border-2 border-teal-600 text-white text-base font-bold rounded-xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:border-emerald-400 hover:text-emerald-300 p-3 text-left before:absolute before:w-10 before:h-10 before:content[''] before:right-2 before:top-2 before:z-10 before:bg-indigo-500 before:rounded-full before:blur-lg before:transition-all before:duration-500 after:absolute after:z-10 after:w-16 after:h-16 after:content[''] after:bg-teal-400 after:right-6 after:top-4 after:rounded-full after:blur-lg after:transition-all after:duration-500 hover:before:right-10 hover:before:-bottom-4 hover:before:blur hover:after:-right-6 hover:after:scale-110">
           
            Start Your Journey
          </button>
        </div> */}
        </section>
      <section className="bg-black relative overflow-hidden pb-20" style={{ minHeight: '60vh' }}>
      <div className="relative text-center pt-12 z-10">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={24}
          className="max-w-4xl mx-auto"
        >
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
              <button className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-full shadow-lg shadow-cyan-500/20 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 ease-in-out">
                <span>Start Your Journey</span>
                <Rocket/>
              </button>
              <p className="text-sm text-gray-400 mt-4 sm:mt-0">
                No credit card required • Free 14-day trial
              </p>
            </div>
          </div>
        </GlassSurface>
      </div>
</section>


    </div>
  );
};

export default HomePage;