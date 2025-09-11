import React from 'react';
import { Database, BarChart3, FileText } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import { useUser,SignIn } from "@clerk/clerk-react"; // or @clerk/nextjs
import bg1 from '../assets/bg1.png';
import { ParticleNetwork } from '@/components/ParticleNetwork';
import SparkleButton from '../components/SparkleButton';
import { BorderBeam } from "@/components/lightswind/border-beam"


const HomePage = ({setActivePage }) => {
  const { isSignedIn } = useUser();


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
      <main className="flex items-center justify-center p-4" style={{ backgroundImage: `url(${bg1})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh' }}>
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
          <div className="flex gap-4 justify-center mb-10">
          
          <SparkleButton
        text="Get Started Now"
        onClick={handleButtonClick}
      />
      </div>
        </div>
        
      </main>

      
    
      {/* Features Section */}
      <section className="bg-black">

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-200 mb-4">
              Powerful Features for Data Excellence
            </h2>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to transform your data into actionable insights, 
              powered by cutting-edge AI technology.
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
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-black">
        <div className="max-w-4xl mx-auto text-center">
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
        </div>

      </section>



    </div>
  );
};

export default HomePage;