import React, { useState } from 'react';
import Papa from 'papaparse';
import { Upload, FileSpreadsheet, Check, Loader2 } from 'lucide-react';

const CleaningPage = ({ setActivePage, setCleanedData }) => {
  const [isUploaded, setIsUploaded] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({
    removeDuplicates: true,
    handleMissing: true,
    standardizeFormats: false,
    removeOutliers: false
  });

  // Robust CSV parser using papaparse
  const parseCSV = (text) => {
    const result = Papa.parse(text, { header: true, skipEmptyLines: true });
    if (result.errors.length) {
      return { headers: [], rows: [], error: result.errors[0].message };
    }
    const headers = result.meta.fields || [];
    const rows = result.data || [];
    return { headers, rows };
  };

  // Build dictionary from selected options (1 for selected, 0 for not)
  const buildDictionary = () => {
    return {
      removeDuplicates: selectedOptions.removeDuplicates ? 1 : 0,
      handleMissing: selectedOptions.handleMissing ? 1 : 0,
      standardizeFormats: selectedOptions.standardizeFormats ? 1 : 0,
      removeOutliers: selectedOptions.removeOutliers ? 1 : 0
    };
  };

  // Send data and dictionary to Flask backend
  const handleProcess = async () => {
    if (!parsedData || !parsedData.rows || parsedData.rows.length === 0) {
      alert('No data to process!');
      return;
    }
    
    setIsProcessing(true);
    const payload = {
      data: parsedData.rows,
      dictionary: buildDictionary(),
    };
    console.log('Process button clicked. Sending payload:', payload);
    
    try {
      const response = await fetch('http://localhost:5000/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      console.log('Received result:', result);
      if (response.ok) {
        // Store the cleaned data and navigate to results page
        setCleanedData(result.cleaned_data || result.data || parsedData.rows);
        setActivePage('results');
      } else {
        alert('Error processing data: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error sending data: ' + error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setIsUploaded(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          // Debug: show raw file content
          console.log('Raw file content:', text);
          const result = Papa.parse(text, { header: true, skipEmptyLines: true });
          // Debug: show papaparse result
          console.log('Papa.parse result:', result);
          if (result.errors.length) {
            setParsedData({ headers: [], rows: [], error: result.errors[0].message, raw: text, parsed: result });
          } else {
            const headers = result.meta.fields || [];
            const rows = result.data || [];
            setParsedData({ headers, rows, raw: text, parsed: result });
          }
        } catch (err) {
          setParsedData({ headers: [], rows: [], error: 'Error parsing file.', raw: '', parsed: null });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleOptionChange = (option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  // ...existing code...

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-200 mb-2">Data Cleaning</h1>
          <p className="text-gray-400">Upload your data and let AI clean it for you</p>
        </div>

        {!isUploaded ? (
          /* Upload Area */
          <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-12 text-center hover:border-teal-500 transition-colors duration-300">
            <div className="flex flex-col items-center">
              <div className="bg-teal-500 p-4 rounded-full mb-4">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-2">
                Drag & Drop Your Files
              </h3>
              <p className="text-gray-400 mb-6">
                Support for CSV, Excel, and other data formats
              </p>
              <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleUpload}
                className="mb-4 text-gray-200"
              />
            </div>
          </div>
        ) : (
          /* Data Preview and Cleaning Options */
          <div className="space-y-8">
            {/* File Info */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <FileSpreadsheet className="w-6 h-6 text-teal-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-200">
                    {uploadedFile ? uploadedFile.name : 'No file uploaded'}
                  </h3>
                  <p className="text-gray-400">
                    {parsedData ? `${parsedData.rows.length} rows, ${parsedData.headers.length} columns` : 'No data parsed'}
                  </p>
                </div>
              </div>
              {/* Debug output removed for clean UI */}
            </div>

            {/* Data Preview */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Data Preview</h3>
              <div className="overflow-x-auto">
                {parsedData && parsedData.headers.length > 0 && parsedData.rows.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        {parsedData.headers.map((header) => (
                          <th key={header} className="text-left py-3 px-4 text-gray-300 font-medium">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.rows.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-700/50">
                          {parsedData.headers.map((header) => (
                            <td key={header} className="py-3 px-4 text-gray-200">
                              {row[header] !== undefined && row[header] !== '' ? row[header] : <span className="text-red-400">Missing</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-gray-400">No data to preview. Please upload a valid CSV file.</div>
                )}
              </div>
            </div>

            {/* Cleaning Options */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Cleaning Options</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { key: 'removeDuplicates', label: 'Remove Duplicate Rows', description: 'Identify and remove duplicate entries' },
                  { key: 'handleMissing', label: 'Handle Missing Values', description: 'Fill or remove missing data points' },
                  { key: 'standardizeFormats', label: 'Standardize Formats', description: 'Normalize date, phone, and text formats' },
                  { key: 'removeOutliers', label: 'Remove Outliers', description: 'Detect and handle statistical outliers' }
                ].map((option) => (
                  <div key={option.key} className="flex items-start space-x-3">
                    <button
                      onClick={() => handleOptionChange(option.key)}
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                        selectedOptions[option.key]
                          ? 'bg-teal-500 border-teal-500'
                          : 'border-gray-600 hover:border-teal-500'
                      }`}
                    >
                      {selectedOptions[option.key] && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <div>
                      <h4 className="text-gray-200 font-medium">{option.label}</h4>
                      <p className="text-gray-400 text-sm">{option.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Process Button */}
            <div className="flex justify-center">
              <button
                className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleProcess}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Process Data'
                )}
              </button>
            </div>

            {/* Loading Screen */}
            {isProcessing && (
              <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 max-w-md mx-4 text-center">
                  <div className="bg-teal-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-200 mb-2">Processing Your Data</h3>
                  <p className="text-gray-400 mb-4">
                    Our AI is cleaning and processing your data. This may take a few moments...
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CleaningPage;

