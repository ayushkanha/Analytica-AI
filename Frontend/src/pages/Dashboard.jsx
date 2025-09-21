import React, { useState, useEffect, useRef, useCallback } from 'react';
import Plot from 'react-plotly.js';


import { useUser, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Send, Bot, User, Database, Plus, Menu, X, MoreVertical, Save, LayoutDashboard, Type, Image as ImageIcon } from 'lucide-react';

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
            className="draggable-chart bg-[#303030] p-3 rounded-lg flex items-center space-x-3 hover:bg-indigo-900 transition-colors duration-200 cursor-grab"
            data-graph={JSON.stringify(graph)} // Store full graph data
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
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

// --- TextBoxWidget Component ---
const TextBoxWidget = ({ widget, onUpdate, onDelete }) => {
    const interactRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(widget.content || '## New Text Box\n\nEnter your text here. You can use **markdown**!');
    const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
    const [showThreeDotIcon, setShowThreeDotIcon] = useState(false);

    const handleContentChange = (e) => {
        setContent(e.target.value);
        onUpdate(widget.instanceId, { content: e.target.value });
    };

    const handleStyleChange = (style) => {
        onUpdate(widget.instanceId, { style: { ...widget.style, ...style } });
    };

    useEffect(() => {
        const element = interactRef.current;
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
                        onUpdate(widget.instanceId, { position: currentPosition });
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
                    },
                    end(event) {
                        const { width, height } = event.rect;
                        onUpdate(widget.instanceId, { size: { width, height } });
                    }
                },
                modifiers: [
                    window.interact.modifiers.restrictEdges({ outer: 'parent' }),
                    window.interact.modifiers.restrictSize({ min: { width: 150, height: 100 } })
                ],
                inertia: true
            });

        return () => {
            if (window.interact && element) {
                window.interact(element).unset();
            }
        };
    }, [widget.instanceId, onUpdate, widget.position]);

    return (
        <div
            ref={interactRef}
            className="resize-drag bg-white/20 backdrop-blur-lg flex flex-col absolute rounded-lg shadow-lg group border border-white/20"
            style={{
                width: `${widget.size.width}px`,
                height: `${widget.size.height}px`,
                transform: `translate(${widget.position.x}px, ${widget.position.y}px)`,
                ...widget.style
            }}
            onMouseEnter={() => setShowThreeDotIcon(true)}
            onMouseLeave={() => setShowThreeDotIcon(false)}
        >
            <div className="h-6 flex items-center justify-between px-2 cursor-move text-gray-400">
                <span className="font-bold truncate"></span>
                <div className="relative flex items-center">
                    {showThreeDotIcon && (
                         <button onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)} className="p-1">
                            <MoreVertical size={18} />
                        </button>
                    )}
                    {isStyleMenuOpen && (
                        <div className="absolute top-8 right-0 flex items-center space-x-2 bg-gray-800 p-1 rounded shadow-lg z-10">
                            <input
                                type="color"
                                title="Change text color"
                                defaultValue={widget.style?.color || '#ffffff'}
                                onChange={(e) => handleStyleChange({ color: e.target.value })}
                                className="w-6 h-6 p-0 border-none rounded cursor-pointer"
                            />
                            <input
                                type="number"
                                title="Change font size"
                                defaultValue={parseInt(widget.style?.fontSize) || 16}
                                onChange={(e) => handleStyleChange({ fontSize: `${e.target.value}px` })}
                                className="w-12 bg-gray-700 text-white rounded border border-gray-600 text-center"
                            />
                             <select
                                title="Change font family"
                                defaultValue={widget.style?.fontFamily || 'sans-serif'}
                                onChange={(e) => handleStyleChange({ fontFamily: e.target.value })}
                                className="bg-gray-700 text-white rounded border border-gray-600 text-center"
                            >
                                <option value="sans-serif">Sans-serif</option>
                                <option value="serif">Serif</option>
                                <option value="monospace">Monospace</option>
                                <option value="Arial">Arial</option>
                                <option value="Verdana">Verdana</option>
                                <option value="Courier New">Courier New</option>
                            </select>
                        </div>
                    )}
                    <button onClick={() => onDelete(widget.instanceId)} className="delete-btn hidden group-hover:block text-gray-500 hover:text-red-500 transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>
            <div
                className="p-2 w-full h-full overflow-auto"
                style={{
                    color: widget.style?.color || '#ffffff',
                    fontFamily: widget.style?.fontFamily || 'sans-serif'
                }}
                onDoubleClick={() => setIsEditing(true)}
            >
                {isEditing ? (
                    <textarea
                        value={content}
                        onChange={handleContentChange}
                        onBlur={() => setIsEditing(false)}
                        autoFocus
                        className="w-full h-full bg-transparent border-none focus:outline-none resize-none"
                        style={{
                            color: widget.style?.color || '#ffffff',
                            fontFamily: widget.style?.fontFamily || 'sans-serif'
                        }}
                    />
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />
                )}
            </div>
        </div>
    );
};

// --- LogoWidget Component ---
const LogoWidget = ({ widget, onUpdate, onDelete }) => {
    const interactRef = useRef(null);

    useEffect(() => {
        const element = interactRef.current;
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
                        onUpdate(widget.instanceId, { position: currentPosition });
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
                    },
                    end(event) {
                        const { width, height } = event.rect;
                        onUpdate(widget.instanceId, { size: { width, height } });
                    }
                },
                modifiers: [
                    window.interact.modifiers.restrictEdges({ outer: 'parent' }),
                    window.interact.modifiers.restrictSize({ min: { width: 50, height: 50 } })
                ],
                inertia: true
            });

        return () => {
            if (window.interact && element) {
                window.interact(element).unset();
            }
        };
    }, [widget.instanceId, onUpdate, widget.position]);

    return (
        <div
            ref={interactRef}
            className="resize-drag bg-transparent flex flex-col absolute rounded-lg group"
            style={{
                width: `${widget.size.width}px`,
                height: `${widget.size.height}px`,
                transform: `translate(${widget.position.x}px, ${widget.position.y}px)`
            }}
        >
            <div className="h-6 flex items-center justify-end px-2 cursor-move text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onDelete(widget.instanceId)} className="delete-btn text-gray-500 hover:text-red-500 transition-colors">
                    <X size={18} />
                </button>
            </div>
            <img src={widget.src} alt="logo" className="w-full h-full object-contain" />
        </div>
    );
};


// --- Main Dashboard Component ---
const Dashboard = ({ c_id, setActivePage }) => {
    const { user } = useUser();
    const userId = user?.id;

    const [storedGraphs, setStoredGraphs] = useState([]);
    const [dashboardItems, setDashboardItems] = useState([]);
    const [notification, setNotification] = useState('');
    const [interactReady, setInteractReady] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedBg, setSelectedBg] = useState('Grad 1');
    const [uploadedBg, setUploadedBg] = useState(null);
    const fileInputRef = useRef(null);
    const logoInputRef = useRef(null);
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
                        setDashboardItems(JSON.parse(savedLayout));
                    }
                } catch (error) {
                    console.error("Error loading dashboard from localStorage:", error);
                }

                // 2. Fetch available graphs from API
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/graphs/${userId}`);
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
                    type: 'graph',
                    graph: graphData,
                    position: { x: dropX - 200, y: dropY - 150 }, // Center on drop
                    size: { width: 400, height: 300 }
                };
                setDashboardItems(prev => [...prev, newWidget]);
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
    const handleUpdateItem = useCallback((instanceId, updates) => {
        setDashboardItems(prev =>
            prev.map(item =>
                item.instanceId === instanceId ? { ...item, ...updates } : item
            )
        );
    }, []);

    const handleDeleteItem = useCallback((instanceId) => {
        setDashboardItems(prev => prev.filter(item => item.instanceId !== instanceId));
    }, []);

    const addTextBox = () => {
        const newItem = {
            instanceId: `textbox-${Date.now()}`,
            type: 'textbox',
            content: '## New Text Box\n\nEnter your text here. You can use **markdown**!',
            position: { x: 50, y: 50 },
            size: { width: 250, height: 150 },
            style: {
                color: '#ffffff',
                fontSize: '16px',
                fontFamily: 'sans-serif'
            }
        };
        setDashboardItems(prev => [...prev, newItem]);
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const newItem = {
                    instanceId: `logo-${Date.now()}`,
                    type: 'logo',
                    src: ev.target.result,
                    position: { x: 50, y: 50 },
                    size: { width: 150, height: 150 },
                };
                setDashboardItems(prev => [...prev, newItem]);
            };
            reader.readAsDataURL(file);
        }
    };


    // --- SAVE & CLEAR HANDLERS ---
    const saveDashboardLayout = () => {
        if (!userId) return;
        try {
            localStorage.setItem(`dashboard-layout-${userId}`, JSON.stringify(dashboardItems));
            setNotification('Dashboard layout saved successfully!');
        } catch (error) {
            console.error("Error saving dashboard to localStorage:", error);
            setNotification('Error: Could not save dashboard.');
        }
    };

    const clearDashboard = () => {
        if (window.confirm("Are you sure you want to clear the dashboard? This cannot be undone.")) {
            if (!userId) return;
            setDashboardItems([]);
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
        <div className="flex h-screen bg-[#181818] text-white font-sans overflow-hidden">
            {/* Sidebar */}

            <aside
                className={`bg-[#181818] p-4 shrink-0 overflow-y-auto flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
                style={{ minWidth: sidebarCollapsed ? '2rem' : '10rem' }}
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
                    {/* Left: Title */}
                    <h1 className="text-2xl font-bold text-gray-200">My Dashboard</h1>

                    {/* Right: All controls */}
                    <div className="flex items-center space-x-4">
                        {/* Group 1: Add items */}
                        <button onClick={addTextBox} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                            <Type size={18} />
                            <span>Add Text Box</span>
                        </button>
                        <button onClick={() => logoInputRef.current.click()} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                            <ImageIcon size={18} />
                            <span>Add Logo</span>
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            ref={logoInputRef}
                            onChange={handleLogoUpload}
                            className="hidden"
                        />

                        {/* Group 2: Background */}
                        <div className="flex items-center space-x-2">
                            <label htmlFor="dashboard-bg-select" className="text-gray-400 font-medium">Background:</label>
                            <select
                                id="dashboard-bg-select"
                                value={selectedBg}
                                onChange={e => {
                                    setSelectedBg(e.target.value);
                                    setTimeout(() => {
                                        if (e.target.value === 'upload' && fileInputRef.current) {
                                            fileInputRef.current.click();
                                        }
                                    }, 0);
                                }}
                                className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none border border-gray-600"
                                style={{ minWidth: 120, appearance: 'auto' }}
                            >
                                {Object.keys(backgrounds).map(bg => (
                                    <option key={bg} value={bg}>{bg}</option>
                                ))}
                                <option value="upload">Upload your own</option>
                            </select>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={e => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => {
                                            setUploadedBg(ev.target.result);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="hidden"
                            />
                        </div>

                        {/* Group 3: Actions */}
                        <button onClick={saveDashboardLayout} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            Save Layout
                        </button>
                        <button onClick={clearDashboard} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            Clear Dashboard
                        </button>

                        {/* Group 4: Auth */}
                        <div>
                            <SignedOut>
                                <SignInButton>
                                    <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors duration-200 border border-white/20 text-sm font-medium">
                                        <User className="w-4 h-4" />
                                        <span className="text-shadow-[0_0_10px_rgba(255,255,255,0.8)] hover:text-shadow-[0_0_15px_rgba(255,255,255,1)] transition-all duration-200">
                                            Sign Up
                                        </span>
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <UserButton afterSignOutUrl="/" />
                            </SignedIn>
                        </div>
                    </div>
                </header>
                {/* Dashboard Grid */}
                <main className="flex-1 p-4 relative">
                    <div
                        ref={dropzoneRef}
                        id="dashboard-grid"
                        className="w-full h-full rounded-lg border-2 border-dashed border-gray-600 relative overflow-hidden"
                        style={{
                            backgroundImage: selectedBg === 'upload' && uploadedBg ? `url(${uploadedBg})` : `url(${backgrounds[selectedBg]})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        {dashboardItems.map(item => {
                            if (item.type === 'graph') {
                                return (
                                    <DashboardWidget
                                        key={item.instanceId}
                                        widget={item}
                                        onUpdate={handleUpdateItem}
                                        onDelete={handleDeleteItem}
                                    />
                                );
                            } else if (item.type === 'textbox') {
                                return (
                                    <TextBoxWidget
                                        key={item.instanceId}
                                        widget={item}
                                        onUpdate={handleUpdateItem}
                                        onDelete={handleDeleteItem}
                                    />
                                );
                            } else if (item.type === 'logo') {
                                return (
                                    <LogoWidget
                                        key={item.instanceId}
                                        widget={item}
                                        onUpdate={handleUpdateItem}
                                        onDelete={handleDeleteItem}
                                    />
                                );
                            }
                            return null;
                        })}
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
