import React, { useEffect } from 'react';
import { Briefcase, DatabaseZap, ShoppingCart, BarChartHorizontal, Sparkles, Wand2, Rocket } from 'lucide-react';
import './SolutionPage.css'; // We'll create this file next for the animations

const SolutionPage = ({ setActivePage }) => {

  // Effect for scroll-reveal animations (from HomePage.jsx)
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // Cleanup
    return () => document.querySelectorAll('.reveal').forEach(el => io.unobserve(el));
  }, []);
  
  // Effect for footer year (from HomePage.jsx)
  useEffect(() => {
    const yearEl = document.getElementById('y');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }, []);

  // Button click handler (from HomePage.jsx)
  const handleButtonClick = () => {
    // This logic is copied from your HomePage.jsx
    // You might want to point this to your signup or cleaning page
    alert("This would navigate to the app or signup!");
    // Example: setActivePage('cleaning');
  };

  return (
    <div className="bg-[#0b0f17] text-slate-200 antialiased selection:bg-cyan-500/30" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji' }}>
      
      {/* Background Layers (from HomePage.jsx) */}
      <div className="pointer-events-none fixed inset-0 z-10">
        <div className="aurora absolute inset-0 opacity-40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.06)_1px,_transparent_1px)] [background-size:24px_24px] grid-mask"></div>
        <div className="absolute -top-24 -left-16 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl animate-glow"></div>
        <div className="absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl animate-glow [animation-delay:2s]"></div>
      </div>

      {/* Header Section */}
      <section className="relative pt-24 md:pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white">
              Solutions for Every Team
            </h1>
            <p className="mt-6 text-lg text-slate-300/90 leading-relaxed">
              Analytica AI is built to empower everyone, from data scientists accelerating their workflow to business teams getting instant answers.
            </p>
          </div>
        </div>
      </section>

      {/* Section 1: Solutions by Role */}
      <section id="solutions-role" className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white">For Every Role in Your Org</h2>
            <p className="mt-4 text-slate-300/90">Automated, explainable, and collaborative.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: For Data Analysts */}
            <div className="reveal rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-lg bg-cyan-500/15 ring-1 ring-cyan-400/30 flex items-center justify-center">
                  <DatabaseZap className="h-5 w-5 text-cyan-300" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">For Data Analysts</h3>
              </div>
              <p className="text-slate-300/90 text-sm">
                Move faster than ever. Let AI handle the tedious 80% of data cleaning and preparation. Focus on high-impact modeling and strategic insights, not fixing messy CSVs and normalizing data.
              </p>
              <div className="mt-4 text-xs text-cyan-300">Auto-Cleaning • SQL Generation • Reproducible Recipes</div>
            </div>

            {/* Card 2: For Business Teams */}
            <div className="reveal rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-lg bg-indigo-500/15 ring-1 ring-indigo-400/30 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-indigo-300" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">For Business Teams</h3>
              </div>
              <p className="text-slate-300/90 text-sm">
                Get the answers you need, when you need them. Use our "Chat Your Data" feature to ask questions in plain English. No SQL knowledge required. Perfect for marketing, sales, and operations.
              </p>
              <div className="mt-4 text-xs text-indigo-300">Natural Language Chat • Instant Dashboards • Shareable Reports</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Solutions by Use Case */}
      <section id="solutions-usecase" className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="mx-auto max-w-2xl text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white">Popular Use Cases</h2>
            <p className="mt-4 text-slate-300/90">From raw data to decision in minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Use Case 1: E-commerce */}
            <div className="reveal rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/15 ring-1 ring-emerald-400/30 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-emerald-300" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">E-commerce Analytics</h3>
              </div>
              <p className="text-slate-300/90 text-sm">Instantly clean and analyze sales data. Understand customer behavior, track cohort performance, and identify top-performing products.</p>
            </div>

            {/* Use Case 2: Marketing */}
            <div className="reveal rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-lg bg-amber-500/15 ring-1 ring-amber-400/30 flex items-center justify-center">
                  <BarChartHorizontal className="h-5 w-5 text-amber-300" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">Marketing Insights</h3>
              </div>
              <p className="text-slate-300/90 text-sm">Combine data from all your platforms. Analyze campaign ROI, visualize customer funnels, and generate reports automatically.</p>
            </div>

            {/* Use Case 3: Operations */}
            <div className="reveal rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 lift md:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-lg bg-rose-500/15 ring-1 ring-rose-400/30 flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-rose-300" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">Operational Efficiency</h3>
              </div>
              <p className="text-slate-300/9Z0 text-sm">Clean up messy operational logs, identify bottlenecks, and create real-time dashboards to monitor your most important KPIs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section (from HomePage.jsx) */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-6 items-center text-center md:text-left">
              <div>
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">Turn questions into answers — instantly</h3>
                <p className="mt-3 text-slate-300/90">Join teams automating their analytics workflows and shipping dashboards faster.</p>
              </div>
              <div className="flex flex-col sm:flex-row md:justify-end gap-3 justify-center">
                <button 
                  onClick={handleButtonClick} 
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-2.5 text-sm text-white hover:opacity-95"
                >
                  <Sparkles className="h-4 w-4" /> Get started free
                </button>
              </div>
            </div>
            {/* decorative orbits */}
            <div className="pointer-events-none absolute -right-12 -bottom-12 h-72 w-72 rounded-full border border-cyan-500/20"></div>
            <div className="pointer-events-none absolute -right-20 bottom-4 h-96 w-96 rounded-full border border-indigo-500/20"></div>
          </div>
        </div>
      </section>

      {/* Footer (from HomePage.jsx) */}
      <footer className="relative border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <a href="#" className="flex items-center gap-3">
                <span className="relative inline-flex h-7 w-7 items-center justify-center">
                  <img src="/logo.png" alt="Analytica Logo" className="h-8 w-8" />
                </span>
                <span className="text-sm font-medium">Analytica</span>
              </a>
            </div>
            <div className="text-xs text-slate-400 order-last md:order-none">
              © <span id="y"></span> Analytica. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-sm">
              <a href="#" className="text-slate-300 hover:text-white">Privacy</a>
              <a href="#" className="text-slate-300 hover:text-white">Terms</a>
              <a href="#" className="text-slate-300 hover:text-white">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SolutionPage;