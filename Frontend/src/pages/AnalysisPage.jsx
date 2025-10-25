import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Database, Plus, Menu, X, MoreVertical, Save } from 'lucide-react';
import StyledButton from '../components/StyledButton';
import Plot from 'react-plotly.js';
import { useUser, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button'; // Import Button component
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
const AnalysisPage = ({ cleanedData, c_id, setC_id, setActivePage, fileName }) => {
  const { user,imageUrl } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const messagesEndRef = useRef(null);

  const [hoveredPlotId, setHoveredPlotId] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const handleChatSelection = (chatId) => {
    setC_id(chatId);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchChats = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/chats/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setChats(data);
        } else {
          console.error('Failed to fetch chats');
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };
    fetchChats();
  }, [user?.id]);

  useEffect(() => {
    if (c_id && chats.length > 0) {
      const currentChat = chats.find((chat) => chat.c_id === c_id);
      if (currentChat) {
        setSelectedChat(currentChat);
      }
    } else {
      setSelectedChat(null);
    }
  }, [c_id, chats]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (c_id) {
        setMessages([]);
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/${c_id}/messages`);
          if (response.ok) {
            const data = await response.json();
            const formattedMessages = data.map((msg) => ([
              {
                id: `user-${msg.id}`,
                type: 'user',
                content: msg.user_message,
                timestamp: new Date(msg.created_at),
              },
              {
                id: `ai-${msg.id}`,
                type: 'ai',
                content: msg.response.type === 'text' ? msg.response.data : 'Here is your plot:',
                visualization: msg.response.type === 'plot' ? msg.response.data : null,
                timestamp: new Date(msg.created_at),
              },
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
            timestamp: new Date(),
          },
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
      const newMessage = { id: `user-${Date.now()}`, type: 'user', content: inputValue, timestamp: new Date() };
      setMessages((prev) => [...prev, newMessage]);
      const currentInput = inputValue;
      setInputValue('');
      const loadingMessage = { id: `ai-loading-${Date.now()}`, type: 'ai', content: 'Analyzing your data...', timestamp: new Date(), isLoading: true };
      setMessages((prev) => [...prev, loadingMessage]);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/analytics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ df: cleanedData || [], query: currentInput, c_id, user_id: user.id, filename: fileName }),
        });
        const result = await response.json();
        setMessages((prev) => prev.filter((msg) => !msg.isLoading));
        if (response.ok) {
          const aiResponse = { id: `ai-${Date.now()}`, type: 'ai', content: result.type === 'text' ? result.data : 'Here is your plot:', timestamp: new Date(), visualization: result.type === 'plot' ? result.data : null };
          setMessages((prev) => [...prev, aiResponse]);
        } else {
          const errorMessage = { id: `ai-error-${Date.now()}`, type: 'ai', content: `Error: ${result.detail}`, timestamp: new Date() };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } catch (error) {
        setMessages((prev) => prev.filter((msg) => !msg.isLoading));
        const errorMessage = { id: `ai-error-${Date.now()}`, type: 'ai', content: `Failed to connect to server: ${error.message}`, timestamp: new Date() };
        setMessages((prev) => [...prev, errorMessage]);
      }
    }
  };

  const handleSaveGraph = async (graphData) => {
    if (!c_id) {
      alert('Cannot save graph: No active chat session.');
      return;
    }
    console.log('Saving graph to Supabase:', graphData);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/graphs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          c_id,
          graph_json: graphData,
          user_id: user ? user.id : null,
        }),
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex" style={{ backgroundColor: '#212121' }}>
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col flex-shrink-0`} style={{ backgroundColor: '#181818', color: 'white' }}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700 py-5">
          {isSidebarOpen && <h2 className="text-lg font-semibold">Chat History</h2>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded-md hover:bg-gray-700">
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {user ? (
            chats.length > 0 ? (
              chats.map((chat) => (
                <div
                  key={chat.c_id}
                  onClick={() => handleChatSelection(chat.c_id)}
                  className={`cursor-pointer p-4 hover:bg-gray-700 transition-colors duration-200 ${c_id === chat.c_id ? 'bg-gray-700 border-l-4 border-teal-500' : ''}`}
                >
                  {isSidebarOpen && <span className="truncate">{chat.name}</span>}
                </div>
              ))
            ) : (
              isSidebarOpen && <p className="p-4 text-gray-500">No chats found.</p>
            )
          ) : (
            isSidebarOpen && <p className="p-4 text-gray-500">Sign in to view chat history.</p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col" style={{ backgroundColor: '#212121' }}>
        {/* Header */}
        <header className="bg-[#212121] border-b border-gray-700 px-4 py-2 flex items-center justify-between flex-shrink-0 w-full">
          {/* Left Section: Logo and Brand */}
          <div className="flex items-center gap-3" onClick={() => setActivePage('home')} style={{ cursor: 'pointer' }}>
            <img src="/logo.png" alt="Analytica Logo" className="h-8 w-8" />
            <span className="text-2xl font-bold text-white hidden sm:inline">Analytica</span>
          </div>

          {/* Center Section: Page Title, Context */}
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-200">{selectedChat ? selectedChat.name : 'AI Data Analysis'}</h1>
            <p className="text-gray-400 text-sm mt-1">Ask questions and get intelligent insights</p>
            {cleanedData && cleanedData.length > 0 && (
              <div className="mt-2 flex items-center justify-center space-x-2 text-xs text-gray-300">
                <Database className="w-3 h-3 text-teal-400" />
                <span>Working with {cleanedData.length} rows × {Object.keys(cleanedData[0]).length} columns</span>
              </div>
            )}
          </div>

          {/* Right Section: User Authentication and Dashboard */}
          <div className="flex items-center gap-4">
            <StyledButton onClick={() => setActivePage('dashboard')} />
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

        {/* Conditional Chat Area */}
        {(!c_id || messages.length > 0) ? (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="w-full max-w-6xl mx-auto space-y-5">
                {messages.map((message) => (
                  <div key={message.id} className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'ai' ? 'bg-blue-400/30' : 'bg-gray-600'}`}>
                      {message.type === 'ai' ? <Bot className="w-4 h-4 text-white " /> : (
                        imageUrl ? (
                          <img src={imageUrl} alt="User" className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )
                      )}
                    </div>
                    <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                      <div
                        onMouseEnter={() => setHoveredPlotId(message.id)}
                        onMouseLeave={() => setHoveredPlotId(null)}
                        className={`group relative overflow-hidden rounded-2xl p-3 font-sans shadow-2xl ${message.visualization ? 'block w-full' : 'inline-block'} bg-neutral-950 text-gray-200`}
                      >
                        <div
                          className="absolute -top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-500/15 blur-3xl transition-all duration-700 group-hover:bg-lime-500/19 "
                        ></div>
                        {message.visualization && (hoveredPlotId === message.id || activeMenuId === message.id) && (
                          <div className="absolute top-2 right-2 ">
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === message.id ? null : message.id)}
                              className="p-1 bg-gray-700 rounded-md hover:bg-gray-600"
                              aria-label="More options"
                              title="More options"
                            >
                              <MoreVertical className="w-4 h-4 text-white" />
                            </button>

                            {activeMenuId === message.id && (
                              <div className="absolute top-8 right-0  bg-gray-600 rounded-md shadow-lg py-1 w-40">
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

                        <p className="leading-relaxed pr-8">{message.content}</p>
                        {message.visualization && (
                          <div
                            className="mt-4"
                          >
                            <Plot
                              data={message.visualization.data}
                              layout={{ ...message.visualization.layout, autosize: true, height: 500, width: undefined, margin: { l: 60, r: 30, t: 60, b: 60 } }}
                              useResizeHandler={true}
                              style={{ width: '100%', height: '100%' }}
                              config={{ responsive: true, displaylogo: false, modeBarButtonsToRemove: ['zoom2d', 'pan2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'toggleSpikelines', 'resetViews'], modeBarButtonsToKeep: ['toImage', 'resetScale2d'] }}
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
            <div className="bg-[#212121]  px-6 py-4 flex-shrink-0">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center space-x-3 bg-[#303030] border border-gray-600 rounded-full pt-2 pr-2 pl-2">
                  <div className="flex-1">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={c_id ? 'Ask me anything about your data...' : 'Please select or create a chat to start.'}
                      className="w-full bg-[#303030]  rounded-full px-4 py-3 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                      rows="1"
                      disabled={!c_id}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || !c_id}
                    className="bg-[#6d6d6d] hover:bg-teal-600 disabled:bg-[#3e3e3e] disabled:cursor-not-allowed border border-gray-600 text-white p-3 mb-2 rounded-full transition-colors duration-200 flex items-center justify-center"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
           
            <h2 className="text-4xl font-semibold text-gray-500 mb-8">What's on the agenda today?</h2>
            <div className="relative w-full max-w-2xl">
              <Plus className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything about your data..."
                className="w-full mr-10 bg-gray-800 border border-gray-700 rounded-full py-4 pl-12 pr-20 text-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                rows="1"
                disabled={!c_id}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || !c_id}
                  className="p-2 rounded-full hover:bg-gray-700 disabled:opacity-50"
                  aria-label="Send message"
                  title="Send message"
                >
                  <Send className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPage;