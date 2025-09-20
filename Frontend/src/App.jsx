import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CleaningPage from './pages/CleaningPage';
import ResultsPage from './pages/ResultsPage';
import AnalysisPage from './pages/AnalysisPage';
import ReportPage from './pages/ReportPage';
import Dashboard from './pages/Dashboard';

import { useUser, SignIn } from "@clerk/clerk-react"; // or @clerk/nextjs

function App() {
  
  const [activePage, setActivePage] = useState('home');
  const [cleanedData, setCleanedData] = useState(null);
  const [c_id, setC_id] = useState(null);
  const [fileName, setFileName] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL)
      .then(response => {
        if (response.ok) {
          console.log('Backend wakeup call successful');
        } else {
          console.error('Backend wakeup call failed');
        }
      })
      .catch(error => {
        console.error('Error during backend wakeup call:', error);
      });
  }, []);

  const handleNavigateToCleaning = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Analysis', user_id: user.id }),
      });
      if (response.ok) {
        const newChat = await response.json();
        setC_id(newChat.c_id);
        setActivePage('cleaning');
      } else {
        alert('Failed to create new chat');
      }
    } catch (error) {
      alert(`Error creating new chat: ${error.message}`);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage setActivePage={handleNavigateToCleaning} />;
      case 'cleaning':
        return <CleaningPage setActivePage={setActivePage} setCleanedData={setCleanedData} c_id={c_id} setFileName={setFileName} user_id={user.id}/>;
      case 'results':
        return <ResultsPage 
          cleanedData={cleanedData} 
          setActivePage={setActivePage} 
          onBack={() => setActivePage('cleaning')} 
        />;
      case 'analysis':
        return <AnalysisPage cleanedData={cleanedData} c_id={c_id} setC_id={setC_id} setActivePage={setActivePage} fileName={fileName} />;
      case 'reports':
        return <ReportPage setActivePage={setActivePage} />;
      case 'dashboard':
        return <Dashboard c_id={c_id} setActivePage={setActivePage} />;
      default:
        return <HomePage setActivePage={handleNavigateToCleaning} />;
    }
  };

  return (
    <div className="App dark">
      {activePage !== 'analysis' && activePage !== 'dashboard' && <Navbar activePage={activePage} setActivePage={setActivePage} handleNavigateToCleaning={handleNavigateToCleaning} />}
      {renderPage()}
    </div>
  );
}

export default App;