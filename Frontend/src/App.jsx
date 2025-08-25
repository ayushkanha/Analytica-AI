import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CleaningPage from './pages/CleaningPage';
import ResultsPage from './pages/ResultsPage';
import AnalysisPage from './pages/AnalysisPage';
import ReportPage from './pages/ReportPage';

function App() {
  const [activePage, setActivePage] = useState('home');
  const [cleanedData, setCleanedData] = useState(null);

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage setActivePage={setActivePage} />;
      case 'cleaning':
        return <CleaningPage setActivePage={setActivePage} setCleanedData={setCleanedData} />;
      case 'results':
        return <ResultsPage 
          cleanedData={cleanedData} 
          setActivePage={setActivePage} 
          onBack={() => setActivePage('cleaning')} 
        />;
      case 'analysis':
        return <AnalysisPage cleanedData={cleanedData} />;
      case 'reports':
        return <ReportPage />;
      default:
        return <HomePage setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="App dark">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      {renderPage()}
    </div>
  );
}

export default App;
