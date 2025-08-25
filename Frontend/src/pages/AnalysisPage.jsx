import React, { useState } from 'react';
import { Send, Bot, User, Database } from 'lucide-react';
import Plot from 'react-plotly.js';

const AnalysisPage = ({ cleanedData }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: cleanedData 
        ? `Hello! I'm your AI Data Analyst. I can see you have ${cleanedData.length} rows of cleaned data with ${Object.keys(cleanedData[0] || {}).length} columns. What would you like to know about your dataset?`
        : "Hello! I'm your AI Data Analyst. I can help you explore and analyze your data. What would you like to know about your dataset?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  // Add data info message if we have cleaned data
  React.useEffect(() => {
    if (cleanedData && cleanedData.length > 0) {
      const dataInfoMessage = {
        id: 2,
        type: 'ai',
        content: `I can see your dataset has the following columns: ${Object.keys(cleanedData[0]).join(', ')}. You can ask me to create visualizations, find patterns, or analyze specific aspects of your data.`,
        timestamp: new Date()
      };
      setMessages(prev => [prev[0], dataInfoMessage]);
    }
  }, [cleanedData]);

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: 'user',
        content: inputValue,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      const currentInput = inputValue;
      setInputValue('');

      // Add loading message
      const loadingMessage = {
        id: messages.length + 2,
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
            data: cleanedData || [],
            dictionary: {
              query: currentInput
            }
          })
        });

        const result = await response.json();
        
        // Remove loading message
        setMessages(prev => prev.filter(msg => !msg.isLoading));

        if (result.status === 'success') {
          // Add AI response with visualization
          const aiResponse = {
            id: messages.length + 2,
            type: 'ai',
            content: result.message,
            timestamp: new Date(),
            visualization: result.visualization
          };
          setMessages(prev => [...prev, aiResponse]);
        } else {
          // Add error message
          const errorMessage = {
            id: messages.length + 2,
            type: 'ai',
            content: `Error: ${result.message}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } catch (error) {
        // Remove loading message
        setMessages(prev => prev.filter(msg => !msg.isLoading));
        
        // Add error message
        const errorMessage = {
          id: messages.length + 2,
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
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-200">AI Data Analysis</h1>
          <p className="text-gray-400">Ask questions about your data and get intelligent insights</p>
          
          {/* Data Info */}
          {cleanedData && cleanedData.length > 0 && (
            <div className="mt-4 flex items-center space-x-2 text-sm text-gray-300">
              <Database className="w-4 h-4 text-teal-400" />
              <span>
                Working with {cleanedData.length} rows × {Object.keys(cleanedData[0]).length} columns
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area - Fixed height with scroll */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-5">
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
                    : 'bg-teal-500 text-white'
                }`}>
                  <p className="leading-relaxed">{message.content}</p>
                  
                  {/* Display visualization if present */}
                  {message.visualization && (
                    <div className="mt-4">
                      {message.visualization.type === 'Graph' && (
                        console.log("Rendering plot with data:", JSON.parse(message.visualization.plot).data) ||
  <Plot
    data={JSON.parse(message.visualization.plot).data}
    layout={{
      ...JSON.parse(message.visualization.plot).layout,
      width: 600,
      height: 400,
      margin: { l: 50, r: 50, t: 50, b: 50 }
    }}
    config={{ displayModeBar: true }}
  />
)}
                      {message.visualization.type === 'Text' && (
                        <div className="text-gray-200">
                          {message.visualization.text}
                        </div>
                      )}
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
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your data..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                rows="1"
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors duration-200"
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
  );
};

export default AnalysisPage;

