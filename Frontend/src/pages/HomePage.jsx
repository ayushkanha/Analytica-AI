import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { useUser } from "@clerk/clerk-react";
import {
  Sparkles,
  Wand2,
  PlayCircle,
  Bolt,
  MessageSquare,
  User,
  Bot,
  BarChart3,
  ShieldCheck,
  Clock,
  UploadCloud,
  Rocket,
  LayoutDashboard,
  Workflow,
  Upload,
  CreditCard,
  Download,
  Copy,
  Share2,
  CheckCircle,
  Send,
  Shield,
  Code2,
  Check,
  X,
  BookOpen
} from 'lucide-react';
import Chart from 'chart.js/auto'; 
import './NewHomePage.css'; 
import fc1 from '../assets/fc1.png';
import fc2 from '../assets/fc2.png';
import fc3 from '../assets/fc3.png';

const HomePage = ({ setActivePage }) => {
  const { isSignedIn } = useUser();
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const nodeRef = useRef(null);

  // Refs for charts
  const heroChartRef = useRef(null);
  const demoChartRef = useRef(null);

  const openVideoPlayer = () => setIsVideoPlayerOpen(true);
  const closeVideoPlayer = () => setIsVideoPlayerOpen(false);

  // Re-using your button logic
  const handleButtonClick = () => {
    if (isSignedIn) {
      setActivePage('cleaning');
    } else {
      alert("Whoa there! Looks like you're trying to get to the good stuff. You'll need to log in first to unlock the magic.");
    }
  };

  // Effect for scroll-reveal animations
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

  // Effect for Charts
  useEffect(() => {
    let heroChartInstance = null;
    let demoChartInstance = null;

    const primaryGrid = { color: 'rgba(255,255,255,0.06)' };
    const primaryTicks = { color: 'rgba(226,232,240,0.7)', font: { family: 'Inter', size: 11 } };

    // Hero chart
    if (heroChartRef.current) {
      const hc = heroChartRef.current.getContext('2d');
      heroChartInstance = new Chart(hc, {
        type: 'bar',
        data: {
          labels: ['Americas', 'EMEA', 'APAC', 'LATAM'],
          datasets: [{
            label: 'Revenue',
            data: [124, 98, 142, 66],
            backgroundColor: ['#22d3ee', '#818cf8', '#34d399', '#f59e0b'].map(c => c + 'cc'),
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: true, backgroundColor: 'rgba(15,23,42,0.95)', titleColor: '#fff', bodyColor: '#e2e8f0', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }
          },
          scales: {
            x: { grid: { display: false }, ticks: primaryTicks },
            y: { grid: { color: primaryGrid.color }, ticks: primaryTicks, beginAtZero: true }
          }
        }
      });
    }

    // Demo chart
    if (demoChartRef.current) {
      const dc = demoChartRef.current.getContext('2d');
      const gradient = dc.createLinearGradient(0, 0, 0, 200);
      gradient.addColorStop(0, 'rgba(56,189,248,0.35)');
      gradient.addColorStop(1, 'rgba(56,189,248,0.05)');
      demoChartInstance = new Chart(dc, {
        type: 'line',
        data: {
          labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
          datasets: [{
            label: 'Revenue',
            data: [21,28,32,40,38,52,58,64,61,70,74,86],
            borderColor: '#22d3ee',
            backgroundColor: gradient,
            fill: true,
            tension: 0.35,
            pointRadius: 2.5,
            pointBackgroundColor: '#22d3ee'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: true, backgroundColor: 'rgba(15,23,42,0.95)', titleColor: '#fff', bodyColor: '#e2e8f0', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }
          },
          scales: {
            x: { grid: { display: false }, ticks: primaryTicks },
            y: { grid: { color: primaryGrid.color }, ticks: primaryTicks, beginAtZero: true }
          }
        }
      });
    }

    // Cleanup
    return () => {
      if (heroChartInstance) heroChartInstance.destroy();
      if (demoChartInstance) demoChartInstance.destroy();
    };
  }, []);

  // Effect for chat simulation
  useEffect(() => {
    const chat = document.getElementById('chatWindow');
    if (!chat) return;

    const messages = [
      { role: 'user', text: 'Which products grew fastest month over month?' },
      { role: 'bot',  text: 'I found 3 products with >20% MoM growth. Displaying a chart and providing SQL in the panel.' },
      { role: 'user', text: 'Create a dashboard with these KPIs and share it with the team.' },
      { role: 'bot',  text: 'Dashboard created: “Growth Watch”. I set it to refresh hourly and sent invites to your team.' }
    ];

    let timeouts = [];

    const bubble = (role, text) => {
      const wrap = document.createElement('div');
      wrap.className = 'flex gap-3';
      
      const avatar = document.createElement('div');
      avatar.className = 'h-7 w-7 shrink-0 rounded-full ' + (role === 'user' ? 'bg-cyan-500/20 ring-1 ring-cyan-500/40' : 'bg-white/5 ring-1 ring-white/10') + ' flex items-center justify-center';
      
      avatar.innerHTML = role === 'user' ? 
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="text-cyan-300"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' : 
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="text-white"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>';

      const msg = document.createElement('div');
      msg.className = 'rounded-lg border px-3 py-2 text-slate-200 text-sm ' + (role === 'user' ? 'border-white/10 bg-white/5' : 'border-indigo-400/20 bg-indigo-500/10 text-indigo-100');
      
      wrap.appendChild(avatar); 
      wrap.appendChild(msg); 
      chat.appendChild(wrap);

      // typewriter
      let i = 0;
      const timer = setInterval(() => {
        msg.textContent = text.slice(0, i++);
        chat.scrollTop = chat.scrollHeight;
        if (i > text.length) clearInterval(timer);
      }, 15);
      timeouts.push(timer);
    };

    let delay = 400;
    messages.forEach((m) => {
      const timer = setTimeout(() => bubble(m.role, m.text), delay);
      timeouts.push(timer);
      delay += 1400 + m.text.length * 15;
    });

    // Cleanup
    return () => {
      timeouts.forEach(clearTimeout);
      timeouts.forEach(clearInterval);
      if (chat) chat.innerHTML = '';
    };
  }, []);

  // Effect for footer year
  useEffect(() => {
    const yearEl = document.getElementById('y');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }, []);

  return (
    <div className="bg-[#0b0f17] text-slate-200 antialiased selection:bg-cyan-500/30" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji' }}>
      
      {/* Video Player Modal */}
      {isVideoPlayerOpen && (
        <Draggable nodeRef={nodeRef} handle=".video-player-header">
          <div ref={nodeRef} className="video-player-overlay fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-xl h-[70vh] max-h-[380px] bg-slate-900/90 backdrop-blur-sm border border-white/10 rounded-lg shadow-2xl z-50">
            <div className="video-player-header flex justify-between items-center p-3 bg-slate-800/80 text-white cursor-move">
              <h3 className="text-lg font-medium">Analytica.ai Demo</h3>
              <button onClick={closeVideoPlayer} className="text-2xl hover:text-red-500 transition-colors">
                &times;
              </button>
            </div>
            <div className="video-player-content pl-2 w-full h-[calc(100%-20px)]">
              <iframe
                width="560" height="315"
                src={import.meta.env.VITE_DEMO_VIDEO_URL}
                title="YouTube video player"

                frameBorder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope;"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </Draggable>
      )}

      {/* Background Layers */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="aurora absolute inset-0 opacity-20"></div>
                <div className="spline-container absolute top-0 left-0 w-full h-full -z-50 opacity-20 text-xs">
<iframe src="https://my.spline.design/glowingplanetparticles-oNju9tQxB1nyaHSc0bBhpEAE" frameborder="0" width="100%" height="100%" id="aura-spline" class="w-full h-full"></iframe>  
                </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.06)_1px,_transparent_1px)] [background-size:24px_24px] grid-mask"></div>
        <div className="absolute -top-24 -left-16 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl animate-glow"></div>
        <div className="absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl animate-glow [animation-delay:2s]"></div>
      </div>

      {/* Hero */}
      <section className="relative pt-7">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-10 md:pt-24 md:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                <Wand2 className="h-3.5 w-3.5 text-cyan-400" />
                AI-powered data automation
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white">
                Clean, analyze, and visualize your data automatically.
              </h1>
              <p className="text-slate-300/90 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Analytica uses AI to fix messy data, answer questions via chat, and generate beautiful dashboards in minutes. No complex setup just insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button 
                  onClick={openVideoPlayer} 
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-white/10 px-5 py-3 text-sm font-medium text-white border border-white/10 hover:bg-white/15 lift"
                >
                  <PlayCircle className="h-5 w-5 text-cyan-400" /> View demo
                </button>
                <button 
                  onClick={handleButtonClick} 
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 hover:opacity-95 active:opacity-90"
                >
                  <Bolt className="h-5 w-5" /> Start free trial
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4">
                <div className="text-sm">
                  <div className="text-white font-semibold">4x faster insights</div>
                  <div className="text-slate-400">vs. manual workflows</div>
                </div>
                <div className="text-sm">
                  <div className="text-white font-semibold">98% clean rate</div>
                  <div className="text-slate-400">auto-fix common issues</div>
                </div>
                <div className="text-sm">
                  <div className="text-white font-semibold">Secure by Design</div>
                  <div className="text-slate-400">privacy-first</div>
                </div>
              </div>
            </div>

            {/* Right visual: Chat + Chart */}
            <div className="relative mt-12 lg:mt-0">
              <div className="absolute -inset-6 rounded-2xl bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 blur-2xl"></div>
              <div className="relative grid gap-4">
                <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4 lift animate-float">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-white">Analytica Chat</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Sparkles className="h-4 w-4 text-cyan-400" />
                      <span className="text-xs">AI</span>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-3">
                      <div className="h-7 w-7 shrink-0 rounded-full bg-cyan-500/20 ring-1 ring-cyan-500/40 flex items-center justify-center">
                        <User className="h-4 w-4 text-cyan-300" />
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-200">
                        Clean the Sales CSV and show revenue by region this quarter.
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-7 w-7 shrink-0 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-cyan-100">
                        Done. 124 rows fixed. Region revenue summarized below.
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Wand2 className="h-3.5 w-3.5 text-cyan-400" />
                      Auto cleaning: removed nulls, normalized currencies
                    </div>
                  </div>
                </div>

                {/* Chart card */}
                <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 lift">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-white tracking-tight">Revenue by Region</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" /> Q3
                    </div>
                  </div>
                  <div className="relative aspect-video rounded-lg bg-white/5">
                    <canvas ref={heroChartRef} className="absolute inset-0"></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trusted bar */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-xs text-slate-400">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-400" /> End-to-end encrypted
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" /> Real-time sync
            </div>
            <div className="flex items-center justify-center gap-2">
              <UploadCloud className="h-4 w-4 text-cyan-400" /> Import CSV, XLSX, DB
            </div>
            <div className="flex items-center justify-center gap-2">
              <Rocket className="h-4 w-4 text-indigo-400" /> Deploy in minutes
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white">Everything you need for modern analytics</h2>
            <p className="mt-4 text-slate-300/90">From messy data to clear insights — automated, explainable, and collaborative.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* AI Cleaning */}
            <div className="reveal rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-lg bg-cyan-500/15 ring-1 ring-cyan-400/30 flex items-center justify-center">
                  <Wand2 className="h-5 w-5 text-cyan-300" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">AI Data Cleaning</h3>
              </div>
              <p className="text-slate-300/90 text-sm">Automatically detect and fix missing values, schema drift, outliers, and inconsistent formats with full audit logs.</p>
              <div className="mt-4 relative overflow-hidden rounded-xl border border-white/10">
                <img alt="3D minimal render" className="h-40 w-full object-cover opacity-70" src={fc1} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10"></div>
                <div className="absolute bottom-3 left-4 text-sm text-slate-200">Clean visualizations</div>
              </div>
              <div className="mt-4 text-xs text-cyan-300">Suggested fixes • One-click apply • Rollback</div>
            </div>

            {/* Chatbot */}
            <div className="reveal rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-lg bg-indigo-500/15 ring-1 ring-indigo-400/30 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-indigo-300" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">Chat Your Data</h3>
              </div>
              <p className="text-slate-300/90 text-sm">Ask questions in plain language and get answers as tables, charts, or summaries. Export queries you can trust.</p>
              <div className="mt-4 relative overflow-hidden rounded-xl border border-white/10">
                <img alt="Mountain night scene" className="h-40 w-full object-cover opacity-70" src={fc2} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10"></div>
                <div className="absolute bottom-3 left-4 text-sm text-slate-200">Reliable at scale</div>
              </div>
              <div className="mt-4 text-xs text-indigo-300">SQL generation • Explain steps • Share threads</div>
            </div>

            {/* Dashboards */}
            <div className="reveal rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 lift md:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/15 ring-1 ring-emerald-400/30 flex items-center justify-center">
                  <LayoutDashboard className="h-5 w-5 text-emerald-300" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">Instant Dashboards</h3>
              </div>
              <p className="text-slate-300/90 text-sm">Generate elegant dashboards with drag-and-drop widgets. Auto-refresh and embed anywhere.</p>
              <div className="mt-9 relative overflow-hidden rounded-xl border border-white/10">
                <img alt="Minimal gradient texture" className="h-40 w-full object-cover opacity-70" src={fc3} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10"></div>
                <div className="absolute bottom-3 left-4 text-sm text-slate-200">Beautiful by default</div>
              </div>
              <div className="mt-4 text-xs text-emerald-300">Charts • KPIs • Cohorts • Funnels</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">From raw files to insights in three steps</h2>
              <div className="space-y-6">
                <div className="reveal flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                  <div className="h-9 w-9 rounded-lg bg-white/5 ring-1 ring-white/10 flex items-center justify-center shrink-0">
                    <Upload className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div>
                    <div className="text-white font-medium">1. Connect data</div>
                    <div className="text-sm text-slate-300/90">CSV, spreadsheets, databases, or APIs. We profile and validate instantly.</div>
                  </div>
                </div>
                <div className="reveal flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                  <div className="h-9 w-9 rounded-lg bg-white/5 ring-1 ring-white/10 flex items-center justify-center shrink-0">
                    <Wand2 className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div>
                    <div className="text-white font-medium">2. Auto-clean with AI</div>
                    <div className="text-sm text-slate-300/90">Fix missing values, normalize columns, deduplicate, and generate a reproducible recipe.</div>
                  </div>
                </div>
                <div className="reveal flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                  <div className="h-9 w-9 rounded-lg bg-white/5 ring-1 ring-white/10 flex items-center justify-center shrink-0">
                    <BarChart3 className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div>
                    <div className="text-white font-medium">3. Ask &amp; visualize</div>
                    <div className="text-sm text-slate-300/90">Chat in natural language and generate dashboards — share with a link or embed.</div>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <a href="#pricing" className="inline-flex items-center justify-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm border border-white/10 hover:bg-white/15 lift">
                  <CreditCard className="h-4 w-4" /> Pricing
                </a>
                <button onClick={handleButtonClick} className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2 text-sm text-white shadow-lg shadow-cyan-500/20 hover:opacity-95">
                  <Download className="h-4 w-4" /> Try it now
                </button>
              </div>
            </div>

            {/* Code-like preview */}
            <div className="reveal rounded-xl border border-white/10 bg-slate-900/60 p-5 mt-12 lg:mt-0">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                  <span className="ml-2">recipe.yaml</span>
                </div>
                <div className="flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  <Share2 className="h-4 w-4" />
                </div>
              </div>
              <pre className="overflow-auto rounded-lg bg-black/40 p-4 text-xs leading-6 text-slate-300"><code>{`# Generated by Analytica
steps:
  - detect_schema: { strict: true }
  - fill_missing: { strategy: median, columns: [price, quantity] }
  - normalize:    { columns: [currency], target: "USD" }
  - parse_dates:  { columns: [order_date], format: "auto" }
  - deduplicate:  { keys: [order_id] }
  - export:       { as: "clean_sales" }`}</code></pre>
              <div className="mt-3 text-xs text-slate-400 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" /> Reproducible. Shareable. Audited.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo: Chat + Chart */}
      <section id="demo" className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white">Chat with your data</h2>
            <p className="mt-4 text-slate-300/90">Ask a question; see a chart. Everything stays explainable with exportable SQL.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Chat simulator */}
            <div className="reveal rounded-xl border border-white/10 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/20 ring-1 ring-indigo-400/30 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-indigo-200" />
                  </div>
                  <div className="text-sm font-medium text-white tracking-tight">Analytica Chat</div>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Private
                </div>
              </div>
              <div id="chatWindow" className="space-y-3 text-sm h-64 overflow-y-auto p-1">
                {/* Messages injected by JS */}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-slate-300">
                  <span className="opacity-70">Type a question…</span>
                </div>
                <button className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-cyan-500 to-indigo-500 px-3 py-2 text-sm text-white hover:opacity-95">
                  <Send className="h-4 w-4" /> Send
                </button>
              </div>
            </div>

            {/* Result chart */}
            <div className="reveal rounded-xl border border-white/10 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-white tracking-tight">Monthly Revenue</div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Code2 className="h-4 w-4" /> SQL
                </div>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <div className="relative aspect-video">
                  <canvas ref={demoChartRef} className="absolute inset-0"></canvas>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-400 break-words">
                Generated with: SELECT month, SUM(total) AS revenue FROM clean_sales GROUP BY month
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-6 items-center text-center md:text-left">
              <div>
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">Turn questions into answers instantly</h3>
                <p className="mt-3 text-slate-300/90">Join teams automating their analytics workflows and shipping dashboards faster.</p>
              </div>
              <div className="flex flex-col sm:flex-row md:justify-end gap-3 justify-center">
                <a href="#" className="inline-flex items-center justify-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm border border-white/10 hover:bg-white/15">
                  <BookOpen className="h-4 w-4" /> Docs
                </a>
                <button onClick={handleButtonClick} className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-2.5 text-sm text-white hover:opacity-95">
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

      {/* Footer */}
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

export default HomePage;