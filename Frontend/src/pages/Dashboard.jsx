import React, { useState, useEffect, useRef, useCallback } from 'react';
import Plot from 'react-plotly.js';

// --- Mock Clerk's useUser hook. Replace this with your actual import ---
import { useUser } from "@clerk/clerk-react";

// Import backgrounds
import Grad1 from "/Backgrounds/Grad 1.jpg";
import Grad2 from "/Backgrounds/Grad 2.jpg";
import Grad3 from "/Backgrounds/Grad 3.jpg";
import Grad4 from "/Backgrounds/Grad 4.jpg";

// --------------------------------------------------------------------

// --- DraggableGraphItem Component (in the sidebar) ---
const DraggableGraphItem = ({ graph }) => {
    return (
        <div 
            id={`drag-${graph.id}`} 
            className="draggable-chart bg-gray-700 p-3 rounded-lg flex items-center space-x-3 hover:bg-indigo-600 transition-colors duration-200 cursor-grab" 
            data-graph={JSON.stringify(graph)} // Store full graph data
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
            <span className="truncate">{graph.name || 'Untitled Graph'}</span>
        </div>
    );
};

// --- DashboardWidget Component (the resizable/draggable graph on the grid) ---
const DashboardWidget = ({ widget, onUpdate, onDelete }) => {
    const interactRef = useRef(null);
    const { graph, position, size, instanceId } = widget;

    useEffect(() => {
        const element = interactRef.current;
        // Do not run interact logic until the library is loaded globally
        if (!element || typeof window.interact === 'undefined') return;

        const currentPosition = { x: widget.position.x, y: widget.position.y };

        window.interact(element)
            .draggable({
                handle: '.cursor-move',
                inertia: true,
                modifiers: [
                    window.interact.modifiers.restrictRect({
                        restriction: 'parent',
                        endOnly: true
                    })
                ],
                autoScroll: true,
                listeners: {
                    move(event) {
                        currentPosition.x += event.dx;
                        currentPosition.y += event.dy;
                        event.target.style.transform = `translate(${currentPosition.x}px, ${currentPosition.y}px)`;
                    },
                    end(event) {
                        onUpdate(instanceId, { position: currentPosition });
                    }
                }
            })
            .resizable({
                edges: { left: true, right: true, bottom: true, top: true },
                listeners: {
                    move(event) {
                        const { width, height } = event.rect;
                        Object.assign(event.target.style, {
                            width: `${width}px`,
                            height: `${height}px`
                        });
                        // The Plot component will resize automatically due to useResizeHandler
                    },
                    end(event) {
                        const { width, height } = event.rect;
                        onUpdate(instanceId, { size: { width, height } });
                    }
                },
                modifiers: [
                    window.interact.modifiers.restrictEdges({ outer: 'parent' }),
                    window.interact.modifiers.restrictSize({ min: { width: 250, height: 200 } })
                ],
                inertia: true
            });
            
        return () => {
            // Cleanup function to remove interact listeners from the element when the component unmounts
            if (window.interact && element) {
                window.interact(element).unset();
            }
        }

    }, [instanceId, onUpdate, widget.position]);


    return (
        <div
    ref={interactRef}
className="resize-drag bg-white/20 backdrop-blur-lg flex flex-col absolute rounded-lg shadow-lg group border border-white/20"    style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        transform: `translate(${position.x}px, ${position.y}px)`
    }}
>
    <div className="h-6 flex items-center justify-between px-2 cursor-move text-gray-400">
        <span className="font-bold truncate">{graph.name}</span>
        <button 
            onClick={() => onDelete(instanceId)}
            className="delete-btn hidden group-hover:block text-gray-500 hover:text-red-500 transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" 
                width="18" height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    </div>

    <div className="chart-container flex-2 w-full h-full">
        <Plot
            data={graph.graph_data.data}
            layout={{
                ...graph.graph_data.layout,
                autosize: true,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(121, 100, 100, 0)',
                font: { color: '#8397b0ff' },
            }}
            config={{ responsive: true, displaylogo: false, modeBarButtonsToRemove: ["zoom2d", "pan2d", "select2d", "lasso2d", "zoomIn2d", "zoomOut2d", "autoScale2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines", "resetViews"], modeBarButtonsToKeep: ["toImage", "resetScale2d"] }}

            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
        />
    </div>
</div>

    );
};


// --- Main Dashboard Component ---
const Dashboard = ({ c_id, setActivePage }) => {
    const { user } = useUser();
    const userId = user?.id;

    const [storedGraphs, setStoredGraphs] = useState([]);
    const [dashboardGraphs, setDashboardGraphs] = useState([]);
    const [notification, setNotification] = useState('');
    const [interactReady, setInteractReady] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedBg, setSelectedBg] = useState('Grad 1');
    const dropzoneRef = useRef(null);
    
    // --- NOTIFICATION ---
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // --- SCRIPT LOADER FOR INTERACT.JS ---
    useEffect(() => {
        if (window.interact) {
            setInteractReady(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/interactjs/dist/interact.min.js';
        script.async = true;
        script.onload = () => setInteractReady(true);
        script.onerror = () => console.error("Failed to load interact.js from CDN.");
        document.body.appendChild(script);

        return () => {
            const foundScript = document.querySelector(`script[src="${script.src}"]`);
            if (foundScript) {
                document.body.removeChild(foundScript);
            }
        };
    }, []);

    // --- LOCALSTORAGE & API DATA LOGIC ---
    useEffect(() => {
        const fetchGraphs = async () => {
            if (userId) {
                // 1. Load layout from localStorage first
                try {
                    const savedLayout = localStorage.getItem(`dashboard-layout-${userId}`);
                    if (savedLayout) {
                        setDashboardGraphs(JSON.parse(savedLayout));
                    }
                } catch (error) {
                    console.error("Error loading dashboard from localStorage:", error);
                }

                // 2. Fetch available graphs from API
                try {
                    const response = await fetch(`http://localhost:8000/graphs/${userId}`);
                    if (response.ok) {
                        const data = await response.json();
                        const parsedData = data.map(graph => {
                            if (graph.graph_data && typeof graph.graph_data === "string") {
                                try {
                                    return { ...graph, graph_data: JSON.parse(graph.graph_data) };
                                } catch (error) {
                                    console.error(`Failed to parse graph_data for graph ${graph.id}:`, error);
                                    // Return a graph with an error state if parsing fails
                                    return { ...graph, graph_data: { data: [], layout: { title: 'Error Loading Graph' } } };
                                }
                            }
                            return graph;
                        });
                        setStoredGraphs(parsedData);
                    } else {
                        console.error("Failed to fetch saved graphs");
                        setStoredGraphs([]); // Set to empty on failure
                    }
                } catch (error) {
                    console.error("Error fetching graphs:", error);
                    setStoredGraphs([]); // Set to empty on error
                }
            }
        };

        fetchGraphs();
    }, [userId]);
    
    // --- INTERACT.JS LOGIC ---
    useEffect(() => {
        if (!interactReady) {
            return; // Don't run until the script is loaded
        }
        
        const dropzone = dropzoneRef.current;
        if (!dropzone) return;

        window.interact('.draggable-chart').draggable({
            inertia: true,
            autoScroll: true,
            listeners: {
                move(event) {
                    const target = event.target;
                    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
                    target.style.transform = `translate(${x}px, ${y}px)`;
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                },
                end(event) {
                    const target = event.target;
                    // Reset position after drag ends (if not dropped on a valid zone, it snaps back)
                    target.style.transform = 'translate(0px, 0px)';
                    target.removeAttribute('data-x');
                    target.removeAttribute('data-y');
                }
            }
        });

        window.interact(dropzone).dropzone({
            accept: '.draggable-chart',
            ondrop(event) {
                const draggableElement = event.relatedTarget;
                const graphData = JSON.parse(draggableElement.dataset.graph);

                // Get sidebar width based on collapsed state
                const sidebarWidth = sidebarCollapsed ? 64 : 256; // w-16 = 4rem = 64px, w-64 = 16rem = 256px

                // Get dropzone position relative to viewport
                const dropzoneRect = dropzone.getBoundingClientRect();
                // Calculate drop position relative to dropzone
                const dropX = event.dragEvent.client.x - dropzoneRect.left;
                const dropY = event.dragEvent.client.y - dropzoneRect.top;

                // Adjust dropX by subtracting sidebar width if needed
                // Actually, dropzone is already positioned after sidebar, so dropX is correct

                const newWidget = {
                    instanceId: `widget-${Date.now()}`,
                    graph: graphData,
                    position: { x: dropX - 200, y: dropY - 150 }, // Center on drop
                    size: { width: 400, height: 300 }
                };
                setDashboardGraphs(prev => [...prev, newWidget]);
            }
        });
        
        return () => {
            if (window.interact) {
                // Safely unset interact instances to prevent errors on component unmount
                window.interact('.draggable-chart').unset();
                if (dropzone) {
                    window.interact(dropzone).unset();
                }
            }
        }
    }, [interactReady, sidebarCollapsed]); // <-- add sidebarCollapsed as dependency

    // --- WIDGET HANDLERS ---
    const handleUpdateWidget = useCallback((instanceId, updates) => {
        setDashboardGraphs(prev =>
            prev.map(widget =>
                widget.instanceId === instanceId ? { ...widget, ...updates } : widget
            )
        );
    }, []);

    const handleDeleteWidget = useCallback((instanceId) => {
        setDashboardGraphs(prev => prev.filter(widget => widget.instanceId !== instanceId));
    }, []);

    // --- SAVE & CLEAR HANDLERS ---
    const saveDashboardLayout = () => {
        if (!userId) return;
        try {
            localStorage.setItem(`dashboard-layout-${userId}`, JSON.stringify(dashboardGraphs));
            setNotification('Dashboard layout saved successfully!');
        } catch (error) {
            console.error("Error saving dashboard to localStorage:", error);
            setNotification('Error: Could not save dashboard.');
        }
    };

    const clearDashboard = () => {
        if (window.confirm("Are you sure you want to clear the dashboard? This cannot be undone.")) {
            if (!userId) return;
            setDashboardGraphs([]);
            try {
                localStorage.removeItem(`dashboard-layout-${userId}`);
                setNotification('Dashboard cleared.');
            } catch (error) {
                console.error("Error clearing dashboard from localStorage:", error);
                 setNotification('Error: Could not clear dashboard.');
            }
        }
    };

    // Map background names to imports
    const backgrounds = {
        'Grad 1': Grad1,
        'Grad 2': Grad2,
        'Grad 3': Grad3,
        'Grad 4': Grad4,
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white font-sans overflow-hidden">
            {/* Sidebar */}
            
            <aside
                className={`bg-gray-800 p-4 shrink-0 overflow-y-auto flex flex-col transition-all duration-300 ${
                    sidebarCollapsed ? 'w-16' : 'w-64'
                }`}
                style={{ minWidth: sidebarCollapsed ? '4rem' : '16rem' }}
            >
                <div className="flex items-center gap-3" onClick={() => setActivePage('home')} style={{ cursor: 'pointer' }}>
                        <img src="/logo.png" alt="Analytica Logo" className="h-8 w-8" />
                        <span className="text-2xl font-bold text-white hidden sm:inline">Analytica</span>
                    </div>
                <div className="flex items-center justify-between mb-6">
                    
                    <h2 className={`text-xl font-bold text-gray-300 transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        Chart Library
                    </h2>
                    {/* Only show toggle button when expanded */}
                    {!sidebarCollapsed && (
                        <button
                            onClick={() => setSidebarCollapsed(true)}
                            className="bg-gray-700 hover:bg-gray-600 rounded-full p-2 text-gray-300 focus:outline-none"
                            title="Collapse sidebar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                    )}
                </div>
                <div className={`space-y-4 transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    {storedGraphs.length > 0 ? (
                        storedGraphs.map(graph => <DraggableGraphItem key={graph.id} graph={graph} />)
                    ) : (
                        <p className="text-gray-500">Loading graphs...</p>
                    )}
                </div>
            </aside>

            {/* Toggle button for collapsed sidebar */}
            {sidebarCollapsed && (
                <button
                    onClick={() => setSidebarCollapsed(false)}
                    className="fixed top-6 left-2 z-50 bg-gray-700 hover:bg-gray-600 rounded-full p-2 text-gray-300 focus:outline-none shadow"
                    title="Expand sidebar"
                    style={{ transition: 'left 0.3s' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            )}

            {/* Main Dashboard Area */}
            <div className={`flex-1 flex flex-col transition-all duration-300`}>
                {/* Header with Controls */}
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h1 className="text-2xl font-bold text-gray-200">My Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        {/* Background dropdown with label */}
                        <div className="flex items-center space-x-2">
                            <label htmlFor="dashboard-bg-select" className="text-gray-400 font-medium">Background:</label>
                            <select
                                id="dashboard-bg-select"
                                value={selectedBg}
                                onChange={e => setSelectedBg(e.target.value)}
                                className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none border border-gray-600"
                                style={{ minWidth: 120, appearance: 'auto' }}
                            >
                                {Object.keys(backgrounds).map(bg => (
                                    <option key={bg} value={bg}>{bg}</option>
                                ))}
                            </select>
                        </div>
                        <button onClick={saveDashboardLayout} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            Save Layout
                        </button>
                        <button onClick={clearDashboard} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            Clear Dashboard
                        </button>
                    </div>
                </header>
                {/* Dashboard Grid */}
                <main className="flex-1 p-4 relative">
                    <div 
                        ref={dropzoneRef} 
                        id="dashboard-grid" 
                        className="w-full h-full rounded-lg border-2 border-dashed border-gray-600 relative overflow-hidden"
                        style={{
                            backgroundImage: `url(${backgrounds[selectedBg]})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        {dashboardGraphs.map(widget => (
                            <DashboardWidget 
                                key={widget.instanceId} 
                                widget={widget}
                                onUpdate={handleUpdateWidget}
                                onDelete={handleDeleteWidget}
                            />
                        ))}
                    </div>
                    {/* Notification Popup */}
                    {notification && (
                        <div className="absolute bottom-5 right-5 bg-gray-700 text-white py-2 px-4 rounded-lg shadow-lg animate-pulse">
                            {notification}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;

