import React, { useState, useEffect } from 'react';

import Plot from 'react-plotly.js';
import { Responsive, WidthProvider } from 'react-grid-layout';

// Import the CSS for react-grid-layout
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const Dashboard = ({ c_id }) => {

  const [storedGraphs, setStoredGraphs] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // State for items currently on the dashboard canvas
  const [dashboardItems, setDashboardItems] = useState([]);
  // State for the layout of items on the canvas
  const [layout, setLayout] = useState([]);

  // Fetch the saved graphs from your new backend endpoint
  useEffect(() => {
    const fetchGraphs = async () => {
      if (c_id) {
        try {
          const response = await fetch(`http://localhost:8000/graphs/${c_id}`);
          if (response.ok) {
            const data = await response.json();
            setStoredGraphs(data);
          } else {
            console.error("Failed to fetch saved graphs");
          }
        } catch (error) {
          console.error("Error fetching graphs:", error);
        }
      }
    };
    fetchGraphs();
  }, [c_id]);

  const onDrop = (newLayout, layoutItem, _event) => {
    const graphId = _event.dataTransfer.getData("text/plain");
    
    // Prevent adding the same graph multiple times
    if (dashboardItems.some(item => item.id.toString() === graphId)) {
        alert("This graph is already on the dashboard.");
        return;
    }

    const graphToAdd = storedGraphs.find(g => g.id.toString() === graphId);

    if (graphToAdd) {
      setDashboardItems([...dashboardItems, graphToAdd]);
      // Add a new layout item for the dropped graph
      setLayout([...layout, { ...layoutItem, i: graphId }]);
    }
  };

  const onRemoveItem = (itemId) => {
    setDashboardItems(dashboardItems.filter(item => item.id.toString() !== itemId));
    setLayout(layout.filter(l => l.i !== itemId));
  };


  return (
    <div className="h-screen bg-gray-900 flex text-white">
      {/* Hidabale Sidebar */}
      <div className={`bg-gray-800 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-10'}`}>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-center hover:bg-gray-700">
          {isSidebarOpen ? '❮' : '❯'}
        </button>
        <div className={`flex-1 overflow-y-auto p-2 ${!isSidebarOpen && 'hidden'}`}>
          <h2 className="text-lg font-semibold mb-4">Stored Graphs</h2>
          {storedGraphs.length > 0 ? (
            storedGraphs.map(graph => (
              <div
                key={graph.id}
                className="p-2 mb-2 bg-gray-700 rounded cursor-pointer hover:bg-teal-600"
                draggable={true}
                unselectable="on"
                onDragStart={e => e.dataTransfer.setData("text/plain", graph.id)}
              >
                {graph.graph_data?.layout?.title?.text || `Graph ID: ${graph.id}`}
              </div>
            ))
          ) : (
            <p className="text-gray-400">No saved graphs.</p>
          )}
        </div>
      </div>

      {/* Customizable Canvas */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800">
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          onLayoutChange={(_layout, layouts) => setLayout(layouts.lg)}
          isDroppable={true}
          onDrop={onDrop}
          rowHeight={100}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          draggableCancel=".plotly" // Prevents conflict with Plotly's internal drag
        >
          {dashboardItems.map(item => (
            <div key={item.id} className="bg-gray-800 rounded-lg shadow-lg p-2 overflow-hidden">
                <div className="w-full h-full relative">
                    <button 
                        onClick={() => onRemoveItem(item.id.toString())}
                        className="absolute top-1 right-1 z-20 text-white bg-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                    >
                        X
                    </button>
                    <Plot
                        data={item.graph_data.data}
                        layout={{ 
                            ...item.graph_data.layout, 
                            autosize: true,
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent',
                            font: { color: '#fff' }
                        }}
                        useResizeHandler={true}
                        style={{ width: '100%', height: '100%' }}
                        config={{ responsive: true }}
                    />
                </div>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
};

export default Dashboard;