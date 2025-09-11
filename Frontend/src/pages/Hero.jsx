import { useEffect, useRef } from "react";
import LiquidGlass from 'liquid-glass-react'
export default function Hero() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let nodes = [];
    const numNodes = 40;

    // create random nodes
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 2,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // dark gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#0f0f1a");
      gradient.addColorStop(1, "#1a1a2e");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          let dx = nodes[i].x - nodes[j].x;
          let dy = nodes[i].y - nodes[j].y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            ctx.strokeStyle = "rgba(0, 200, 255, 0.1)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();

            // glowing pulse along line
            const t = Date.now() * 0.002;
            const pulseX = nodes[i].x + (nodes[j].x - nodes[i].x) * (0.5 + 0.5 * Math.sin(t));
            const pulseY = nodes[i].y + (nodes[j].y - nodes[i].y) * (0.5 + 0.5 * Math.sin(t));
            ctx.beginPath();
            ctx.arc(pulseX, pulseY, 3, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0, 255, 255, 0.8)";
            ctx.shadowColor = "cyan";
            ctx.shadowBlur = 10;
            ctx.fill();
          }
        }
      }

      // draw nodes
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "#00f7ff";
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    draw();
  }, []);

  return (
    <div className="relative w-full h-screen flex items-center justify-center text-center">
      {/* Canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Hero Content */}
      <div className="relative z-10 text-white max-w-3xl">
        <h1 className="text-5xl font-bold mb-6">
          More than authentication,<br /> Complete User Management
        </h1>
        <p className="text-lg text-gray-300 mb-6">
          Launch faster, scale easier, and stay focused on building your business.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-6 py-3 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-500">
            Start building for free
          </button>
          <LiquidGlass>
          <button className="px-6 py-3 border border-gray-400 rounded-lg font-semibold hover:bg-gray-700">
            Watch demo
          </button></LiquidGlass>
        </div>
      </div>
    </div>
  );
}
