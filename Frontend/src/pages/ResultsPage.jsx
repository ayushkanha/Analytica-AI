import React from 'react';
import { Download, BarChart3, CheckCircle, ArrowLeft } from 'lucide-react';

const ResultsPage = ({ cleanedData, setActivePage, onBack }) => {
  const handleDownload = () => {
    if (!cleanedData) return;
    
    // Convert data to CSV format
    const headers = Object.keys(cleanedData[0] || {});
    const csvContent = [
      headers.join(','),
      ...cleanedData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle values that contain commas by wrapping in quotes
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cleaned_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleGoToAnalysis = () => {
    setActivePage('analysis');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 px-6 py-8">
      <div className="max-w-4xl mx-auto mt-20">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-sm text-gray-400 hover:text-gray-100 transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-green-500 p-3 rounded-full">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-200">Data Processing Complete!</h1>
              <p className="text-gray-400">Your data has been successfully cleaned and processed</p>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="bg-[#111111] rounded-lg p-6 border border-gray-800 mb-8">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Processing Summary</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <h3 className="text-gray-300 font-medium mb-2">Original Data</h3>
              <p className="text-2xl font-bold text-teal-400">
                {cleanedData ? cleanedData.length : 0} rows
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <h3 className="text-gray-300 font-medium mb-2">Cleaned Data</h3>
              <p className="text-2xl font-bold text-green-400">
                {cleanedData ? cleanedData.length : 0} rows
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Download Option */}
          <div className="bg-[#111111] rounded-lg p-6 border border-gray-800 hover:border-teal-500 transition-colors duration-300">
            <div className="text-center">
              <div className="bg-teal-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-3">Download Cleaned Data</h3>
              <p className="text-gray-400 mb-6">
                Get your cleaned data as a CSV file ready for use in other applications
              </p>
              <button
                onClick={handleDownload}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                Download CSV
              </button>
            </div>
          </div>

          {/* Analysis Option */}
          <div className="bg-[#111111] rounded-lg p-6 border border-gray-800 hover:border-purple-500 transition-colors duration-300">
            <div className="text-center">
              <div className="bg-purple-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-3">Analyze Data</h3>
              <p className="text-gray-400 mb-6">
                Continue to our AI-powered analysis tools to uncover insights and patterns
              </p>
              <button
                onClick={handleGoToAnalysis}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                Go to Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Data Preview */}
        {cleanedData && cleanedData.length > 0 && (
          <div className="mt-8 bg-[#111111] rounded-lg border border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="text-lg font-semibold text-gray-200">Preview of Cleaned Data</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#0a0a0a] border-b border-gray-800">
                  <tr >
                    {Object.keys(cleanedData[0] || {}).map((header) => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {cleanedData.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#0a0a0a] transition-colors">
                      {Object.keys(cleanedData[0] || {}).map((header) => (
                        <td key={header} className="px-6 py-4 text-gray-300">
                          {row[header] !== undefined && row[header] !== '' ? row[header] : <span className="text-gray-500">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {cleanedData.length > 5 && (
                <div className="px-6 py-4 border-t border-gray-800">
                    <p className="text-gray-400 text-sm text-center">
                        Showing first 5 rows of {cleanedData.length} total rows
                    </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;