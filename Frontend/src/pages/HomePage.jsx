import React from 'react';
import { Database, BarChart3, FileText } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';

const HomePage = ({ setActivePage }) => {
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
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-200 mb-6 leading-tight">
            Turn Your Data Into{' '}
            <span className="text-teal-400">Dialogue</span>.
          </h1>
          <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-2xl mx-auto">
            Transform raw data into meaningful conversations with our AI-powered visualization platform. 
            Clean, analyze, and report on your data with the power of artificial intelligence.
          </p>
          <button 
            onClick={setActivePage}
            className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-gray-800/50">
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
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-200 mb-4">
            Ready to Transform Your Data?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Join thousands of data professionals who trust AI Visualizer for their analytics needs.
          </p>
          <button 
            onClick={setActivePage}
            className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25"
          >
            Start Your Journey
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

