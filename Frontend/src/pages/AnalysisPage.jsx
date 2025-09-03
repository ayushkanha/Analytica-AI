import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Database, Plus, Menu, X, MoreVertical, Save, LayoutDashboard } from 'lucide-react';
import Plot from 'react-plotly.js';
import { useUser } from "@clerk/clerk-react"; // or @clerk/nextjs



const AnalysisPage = ({ cleanedData, c_id, setActivePage }) => {
  const { user } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const [hoveredPlotId, setHoveredPlotId] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (c_id) {
        setMessages([]);
        try {
          const response = await fetch(`http://localhost:8000/chat/${c_id}/messages`);
          if (response.ok) {
            const data = await response.json();
            const formattedMessages = data.map((msg) => ([
              {
                id: `user-${msg.id}`,
                type: 'user',
                content: msg.user_message,
                timestamp: new Date(msg.created_at)
              },
              {
                id: `ai-${msg.id}`,
                type: 'ai',
                content: msg.response.type === 'text' ? msg.response.data : 'Here is your plot:',
                visualization: msg.response.type === 'plot' ? msg.response.data : null,
                timestamp: new Date(msg.created_at)
              }
            ])).flat();
            setMessages(formattedMessages);
          } else {
            console.error('Failed to fetch messages for chat', c_id);
            setMessages([]);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
          setMessages([]);
        }
      } else {
        setMessages([
          {
            id: 1,
            type: 'ai',
            content: "Hello! I'm your AI Data Analyst. Please select a chat from the sidebar or create a new one to begin.",
            timestamp: new Date()
          }
        ]);
      }
    };
    fetchMessages();
  }, [c_id]);

  const handleSendMessage = async () => {
    // ... (This function remains unchanged)
    if (!c_id) {
      alert('Error: No chat session found. Please go back to the home page and start a new analysis.');
      return;
    }
    if (inputValue.trim()) {
      const newMessage = { id: `user-${Date.now()}`, type: 'user', content: inputValue, timestamp: new Date() };
      setMessages(prev => [...prev, newMessage]);
      const currentInput = inputValue;
      setInputValue('');
      const loadingMessage = { id: `ai-loading-${Date.now()}`, type: 'ai', content: "Analyzing your data...", timestamp: new Date(), isLoading: true };
      setMessages(prev => [...prev, loadingMessage]);
      try {
        const response = await fetch('http://localhost:8000/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ df: cleanedData || [], query: currentInput, c_id: c_id })
        });
        const result = await response.json();
        setMessages(prev => prev.filter(msg => !msg.isLoading));
        if (response.ok) {
          const aiResponse = { id: `ai-${Date.now()}`, type: 'ai', content: result.type === 'text' ? result.data : 'Here is your plot:', timestamp: new Date(), visualization: result.type === 'plot' ? result.data : null };
          setMessages(prev => [...prev, aiResponse]);
        } else {
          const errorMessage = { id: `ai-error-${Date.now()}`, type: 'ai', content: `Error: ${result.detail}`, timestamp: new Date() };
          setMessages(prev => [...prev, errorMessage]);
        }
      } catch (error) {
        setMessages(prev => prev.filter(msg => !msg.isLoading));
        const errorMessage = { id: `ai-error-${Date.now()}`, type: 'ai', content: `Failed to connect to server: ${error.message}`, timestamp: new Date() };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  const handleSaveGraph = async (graphData) => {
   
    if (!c_id) {
      alert('Cannot save graph: No active chat session.');
      return;
    }
    console.log("Saving graph to Supabase:", graphData);
    try {
      const response = await fetch('http://localhost:8000/graphs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          c_id: c_id,
          graph_json: graphData,
          user_id: user ? user.id : null
        })
      });

      if (response.ok) {
        alert('Graph saved successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to save graph: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Error connecting to server: ${error.message}`);
    } finally {
      setActiveMenuId(null);
    }
  };

  const handleKeyPress = (e) => {
    // ... (This function remains unchanged)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`bg-gray-800 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col flex-shrink-0`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {isSidebarOpen && <h2 className="text-lg font-semibold">Chat History</h2>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded-md hover:bg-gray-700">
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto"></div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex-shrink-0">
          <div className="max-w-4xl mx-auto text-center relative">
            <h1 className="text-xl font-semibold text-gray-200">AI Data Analysis</h1>
            <button 
              onClick={() => setActivePage('dashboard')} 
              className="absolute top-1/2 right-0 -translate-y-1/2 bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <p className="text-gray-400 text-sm">Ask questions about your data and get intelligent insights</p>
            {cleanedData && cleanedData.length > 0 && (
              <div className="mt-2 flex items-center justify-center space-x-2 text-xs text-gray-300">
                <Database className="w-3 h-3 text-teal-400" />
                <span>Working with {cleanedData.length} rows × {Object.keys(cleanedData[0]).length} columns</span>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="w-full max-w-6xl mx-auto space-y-5">
            {messages.map((message) => (
              <div key={message.id} className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'ai' ? 'bg-teal-500' : 'bg-gray-600'}`}>
                  {message.type === 'ai' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                </div>
                <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>

                  <div
                    onMouseEnter={() => setHoveredPlotId(message.id)}
                    onMouseLeave={() => setHoveredPlotId(null)}
                    className={`relative p-4 rounded-lg ${message.visualization ? 'block w-full' : 'inline-block'} ${message.type === 'ai' ? 'bg-gray-800 border border-gray-700 text-gray-200' : 'bg-teal-500 text-white'}`}
                  >

                    {/* 2. Menu is now a direct child of the bubble, positioned absolutely */}
                    {message.visualization && (hoveredPlotId === message.id || activeMenuId === message.id) && (
                      <div className="absolute top-2 right-2 z-40">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === message.id ? null : message.id)}
                          className="p-1 bg-gray-700 rounded-md hover:bg-gray-600"
                          aria-label="More options"
                          title="More options"
                        >
                          <MoreVertical className="w-4 h-4 text-white" />
                        </button>

                        {activeMenuId === message.id && (
                          <div className="absolute top-8 right-0 z-50 bg-gray-600 rounded-md shadow-lg py-1 w-40">
                            <button
                              onClick={() => handleSaveGraph(message.visualization)}
                              className="flex items-center space-x-2 w-full text-left px-3 py-2 text-sm text-white hover:bg-teal-600"
                            >
                              <Save className="w-4 h-4" />
                              <span>Save Graph JSON</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="leading-relaxed pr-8">{message.content}</p> {/* Added padding-right to avoid text overlap */}
                    
                    {message.visualization && (
                      // 3. Hover events are still on the plot container, but it no longer needs to be 'relative' for the button
                      <div
                        className="mt-4"
                        
                      >
                        <Plot
                          data={message.visualization.data}
                          layout={{ ...message.visualization.layout, autosize: true, height: 500, width: undefined, margin: { l: 60, r: 30, t: 60, b: 60 } }}
                          useResizeHandler={true}
                          style={{ width: "100%", height: "100%" }}
                          config={{ responsive: true, displaylogo: false, modeBarButtonsToRemove: ["zoom2d", "pan2d", "select2d", "lasso2d", "zoomIn2d", "zoomOut2d", "autoScale2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines", "resetViews"], modeBarButtonsToKeep: ["toImage", "resetScale2d"] }}
                        />
                      </div>
                    )}
                    
                    {message.isLoading && (
                      <div className="mt-4 flex items-center space-x-2 text-teal-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-400"></div>
                        <span className="text-sm">Processing...</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
         <div className="bg-gray-800 border-t border-gray-700 px-6 py-4 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={c_id ? "Ask me anything about your data..." : "Please select or create a chat to start."}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  rows="1"
                  disabled={!c_id}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || !c_id}
                className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default AnalysisPage;