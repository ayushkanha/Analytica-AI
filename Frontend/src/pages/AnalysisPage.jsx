import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Database, Plus, Menu, X } from 'lucide-react';
import Plot from 'react-plotly.js';

const AnalysisPage = ({ cleanedData, c_id }) => {
  
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  

  useEffect(() => {
    const fetchMessages = async () => {
      if (c_id) {
        setMessages([]); // Clear messages while loading new chat
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
    if (!c_id) {
      alert('Error: No chat session found. Please go back to the home page and start a new analysis.');
      return;
    }

    if (inputValue.trim()) {
      const newMessage = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: inputValue,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMessage]);
      const currentInput = inputValue;
      setInputValue('');

      // Add loading message
      const loadingMessage = {
        id: `ai-loading-${Date.now()}`,
        type: 'ai',
        content: "Analyzing your data...",
        timestamp: new Date(),
        isLoading: true
      };
      setMessages(prev => [...prev, loadingMessage]);

      try {
        // Send request to backend
        const response = await fetch('http://localhost:8000/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            df: cleanedData || [],
            query: currentInput,
            c_id: c_id
          })
        });

        const result = await response.json();

        // Remove loading message
        setMessages(prev => prev.filter(msg => !msg.isLoading));

        if (response.ok) {
          // Add AI response with visualization
          const aiResponse = {
            id: `ai-${Date.now()}`,
            type: 'ai',
            content: result.type === 'text' ? result.data : 'Here is your plot:',
            timestamp: new Date(),
            visualization: result.type === 'plot' ? result.data : null
          };
          setMessages(prev => [...prev, aiResponse]);
        } else {
          // Add error message
          const errorMessage = {
            id: `ai-error-${Date.now()}`,
            type: 'ai',
            content: `Error: ${result.detail}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } catch (error) {
        // Remove loading message
        setMessages(prev => prev.filter(msg => !msg.isLoading));

        // Add error message
        const errorMessage = {
          id: `ai-error-${Date.now()}`,
          type: 'ai',
          content: `Failed to connect to server: ${error.message}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  

  

  const handleKeyPress = (e) => {
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
        <div className="flex-1 overflow-y-auto">
          
          
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex-shrink-0">
  <div className="max-w-4xl mx-auto text-center">
    <h1 className="text-xl font-semibold text-gray-200">AI Data Analysis</h1>
    <p className="text-gray-400 text-sm">
      Ask questions about your data and get intelligent insights
    </p>

    {/* Data Info */}
    {cleanedData && cleanedData.length > 0 && (
      <div className="mt-2 flex items-center justify-center space-x-2 text-xs text-gray-300">
        <Database className="w-3 h-3 text-teal-400" />
        <span>
          Working with {cleanedData.length} rows × {Object.keys(cleanedData[0]).length} columns
        </span>
      </div>
    )}
  </div>
</div>


        {/* Messages Area - Fixed height with scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="w-full max-w-6xl mx-auto space-y-5">
            {messages.map((message) => (
              <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'ai' ? 'bg-teal-500' : 'bg-gray-600'
              }`}>
                {message.type === 'ai' ? (
                  <Bot className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className={`flex-1 max-w-3xl ${
                message.type === 'user' ? 'text-right' : ''
              }`}>
                <div className={`inline-block p-4 rounded-lg ${
                  message.type === 'ai'
                    ? 'bg-gray-800 border border-gray-700 text-gray-200'
                    : 'bg-teal-500 text-.white'
                }`}>
                  <p className="leading-relaxed">{message.content}</p>
                  
                  {/* Display visualization if present */}
                  {message.visualization && (
                    <div className="mt-4">
                      <Plot
                          data={message.visualization.data}
                          layout={{
                            ...message.visualization.layout,
                            autosize: true,
                            margin: { l: 50, r: 50, t: 50, b: 50 }
                          }}
                          useResizeHandler={true}
                          style={{ width: "100%", height: "500px" }}
                          config={{
                                  displaylogo: false, // remove Plotly logo
                                  modeBarButtonsToRemove: [
                                    "zoom2d",
                                    "pan2d",
                                    "select2d",
                                    "lasso2d",
                                    "zoomIn2d",
                                    "zoomOut2d",
                                    "autoScale2d",
                                    
                                    "hoverClosestCartesian",
                                    "hoverCompareCartesian",
                                    "toggleSpikelines",
                                    "resetViews",
                                  ],
                                  modeBarButtonsToKeep: ["toImage", "resetScale2d"], // keep only download + home
                                }}
                        />
                    </div>
                  )}
                  
                  {/* Loading indicator */}
                  {message.isLoading && (
                    <div className="mt-4 flex items-center space-x-2 text-teal-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-400"></div>
                      <span className="text-sm">Processing...</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="bg-gray-800 border-t border-gray-700 px-6 py-4 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-3"> {/* changed items-end → items-center */}
              <div className="flex-1">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    c_id
                      ? "Ask me anything about your data..."
                      : "Please select or create a chat to start."
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  rows="1"
                  disabled={!c_id}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || !c_id}
                className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
                style={{ marginTop: "-3px" }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalysisPage;