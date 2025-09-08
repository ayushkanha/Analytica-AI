import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Check, Loader2, FileText, FileSpreadsheet as ExcelIcon } from 'lucide-react';

const CleaningPage = ({ setActivePage, setCleanedData, c_id, setFileName, user_id }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({
    aiMagic: false,
    removeDuplicates: true,
    handleMissing: true,
    missingStrategy: 'fill', // 'fill' or 'remove'
    standardizeFormats: false,
    removeOutliers: false
  });
  const [aiInstruction, setAiInstruction] = useState('');

  // Robust CSV parser using papaparse
  const parseCSV = (text) => {
    // Remove trailing unmatched quotes before parsing
    const cleanedText = text.replace(/"(\s*[\r\n]|$)/g, '$1');
  
    const result = Papa.parse(cleanedText, { 
      header: true, 
      skipEmptyLines: true,
      quoteChar: '"',
      escapeChar: '"',
      relaxQuotes: true
    });
  
    if (result.errors.length) {
      console.warn("CSV Parse Errors:", result.errors);
    }
  
    const headers = result.meta.fields || [];
    const rows = result.data || [];
    return { headers, rows };
  };
  
  
  

  // Parse Excel files using xlsx
  const parseExcel = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON with headers
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) {
            resolve({ headers: [], rows: [], error: 'Excel file is empty' });
            return;
          }
          
          const headers = jsonData[0];
          const rows = jsonData.slice(1).map(row => {
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });
          
          resolve({ headers, rows });
        } catch (err) {
          resolve({ headers: [], rows: [], error: 'Error parsing Excel file: ' + err.message });
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Universal file parser that detects file type
  const parseFile = async (file) => {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      // Handle CSV files
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target.result;
          const result = parseCSV(text);
          resolve(result);
        };
        reader.readAsText(file);
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Handle Excel files
      return await parseExcel(file);
    } else {
      // Unsupported file type
      return { headers: [], rows: [], error: 'Unsupported file type. Please upload a CSV or Excel file.' };
    }
  };

  // Build dictionary from selected options (1 for selected, 0 for not)
  const buildDictionary = () => {
    return {
      aiMagic: selectedOptions.aiMagic ? 1 : 0,
      removeDuplicates: selectedOptions.removeDuplicates ? 1 : 0,
      handleMissing: selectedOptions.handleMissing ? 1 : 0,
      missingStrategy: selectedOptions.missingStrategy,
      standardizeFormats: selectedOptions.standardizeFormats ? 1 : 0,
      removeOutliers: selectedOptions.removeOutliers ? 1 : 0,
      aiInstruction: selectedOptions.aiMagic ? aiInstruction : ''
    };
  };

  // Send data and dictionary to Flask backend
  const handleProcess = async () => {
    if (!c_id) {
      alert('Error: No chat session found. Please go back to the home page and start a new analysis.');
      return;
    }

    if (!parsedData || !parsedData.rows || parsedData.rows.length === 0) {
      alert('No data to process!');
      return;
    }
    
    setIsProcessing(true);
    const payload = {
      data: parsedData.rows,
      dictionary: buildDictionary(),
      c_id: c_id,
      user_id: user_id,
    };
    console.log('Process button clicked. Sending payload:', payload);
    
    try {
      const response = await fetch('https://analytica-ai-backend-68kc.onrender.com/process', {
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

  // File validation
  const isValidFileType = (file) => {
    const fileName = file.name.toLowerCase();
    return fileName.endsWith('.csv') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (isValidFileType(file)) {
        handleFileUpload(file);
      } else {
        alert('Please upload a valid CSV or Excel file.');
      }
    }
  };

  // Handle file upload (used by both drag & drop and file input)
  const handleFileUpload = async (file) => {
    setUploadedFile(file);
    if (setFileName) {
      setFileName(file.name);
    }
    
    try {
      // Use the universal parser
      const result = await parseFile(file);
      
      if (result.error) {
        setParsedData({ headers: [], rows: [], error: result.error, raw: '', parsed: null });
      } else {
        const headers = result.headers || [];
        const rows = result.rows || [];
        setParsedData({ headers, rows, raw: '', parsed: result });
      }
    } catch (err) {
      setParsedData({ headers: [], rows: [], error: 'Error parsing file: ' + err.message, raw: '', parsed: null });
    }
  };

  const handleOptionChange = (option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleMissingStrategyChange = (strategy) => {
    setSelectedOptions(prev => ({
      ...prev,
      missingStrategy: strategy
    }));
  };

  const handleAIMagicChange = () => {
    setSelectedOptions(prev => ({
      ...prev,
      aiMagic: !prev.aiMagic,
      // When AI Magic is enabled, disable other options
      removeDuplicates: !prev.aiMagic,
      handleMissing: !prev.aiMagic,
      standardizeFormats: !prev.aiMagic,
      removeOutliers: !prev.aiMagic
    }));
  };


  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      <div className="max-w-6xl mx-auto mt-20">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-200 mb-2">Data Cleaning</h1>
          <p className="text-gray-400">Upload your data and let AI clean it for you</p>
        </div>

        {/* Data Preview and Cleaning Options */}
        <div className="space-y-8">
          {/* File Upload Section */}
          <div 
            className={`bg-gray-800 rounded-lg p-8 border-2 border-dashed transition-colors duration-200 ${
              isDragOver 
                ? 'border-teal-400 bg-teal-900/20' 
                : 'border-gray-700'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="mb-6">
              <div className="bg-teal-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-200 mb-2 text-center">Upload Your Data</h2>
              <p className="text-gray-400 mb-6 text-center">
                {isDragOver 
                  ? 'Drop your file here!' 
                  : 'Drag and drop CSV or Excel files here, or click to browse'
                }
              </p>
              
              {/* Supported File Types */}
              <div className="flex items-center justify-center space-x-6 mb-6">
                <div className="flex items-center space-x-2 text-gray-300">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">CSV Files</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <ExcelIcon className="w-5 h-5 text-green-400" />
                  <span className="text-sm">Excel Files</span>
                </div>
              </div>
            </div>

            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && isValidFileType(file)) {
                  handleFileUpload(file);
                } else if (file) {
                  alert('Please upload a valid CSV or Excel file.');
                }
              }}
              className="hidden"
              id="file-upload"
            />
            <div className="flex justify-center">
              <label
                htmlFor="file-upload"
                className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 cursor-pointer inline-block"
              >
                Choose File
              </label>
            </div>
            
            {uploadedFile && (
              <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex items-center space-x-3">
                  {uploadedFile.name.toLowerCase().endsWith('.csv') ? (
                    <FileText className="w-5 h-5 text-blue-400" />
                  ) : (
                    <ExcelIcon className="w-5 h-5 text-green-400" />
                  )}
                  <div className="text-left">
                    <p className="text-gray-200 font-medium">{uploadedFile.name}</p>
                    <p className="text-gray-400 text-sm">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

            {/* Data Preview Section */}
            {parsedData && parsedData.rows && parsedData.rows.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <FileSpreadsheet className="w-6 h-6 text-teal-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200">Data Preview</h3>
                    <p className="text-gray-400">
                      {parsedData.rows.length} rows, {parsedData.headers.length} columns
                    </p>
                  </div>
                </div>
                
                {/* Data Table Preview */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-300">
                    <thead>
                      <tr className="border-b border-gray-600">
                        {parsedData.headers.map((header, index) => (
                          <th key={index} className="text-left py-2 px-3 font-medium text-gray-200">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.rows.slice(0, 5).map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-gray-700 hover:bg-gray-700">
                          {parsedData.headers.map((header, colIndex) => (
                            <td key={colIndex} className="py-2 px-3 text-gray-300">
                              {row[header] || ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedData.rows.length > 5 && (
                    <p className="text-gray-400 text-sm mt-2 text-center">
                      Showing first 5 rows of {parsedData.rows.length} total rows
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Error Display */}
            {parsedData && parsedData.error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">!</span>
                  </div>
                  <h3 className="text-lg font-semibold text-red-400">Error Processing File</h3>
                </div>
                <p className="text-red-200">{parsedData.error}</p>
                <div className="mt-4 text-sm text-red-300">
                  <p>Supported file types:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>CSV files (.csv)</li>
                    <li>Excel files (.xlsx, .xls)</li>
                  </ul>
                  <p className="mt-2">Please ensure your file is not corrupted and contains valid data.</p>
                </div>
              </div>
            )}

            {/* Cleaning Options */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Cleaning Options</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { 
                    key: 'aiMagic', 
                    label: 'AI Magic', 
                    description: 'Let AI handle the cleaning with its magic',
                    special: true
                  },
                  { 
                    key: 'removeDuplicates', 
                    label: 'Remove Duplicate Rows', 
                    description: 'Identify and remove duplicate entries',
                    disabled: selectedOptions.aiMagic
                  },
                  { 
                    key: 'handleMissing', 
                    label: 'Handle Missing Values', 
                    description: 'Fill or remove missing data points',
                    disabled: selectedOptions.aiMagic
                  },
                  { 
                    key: 'standardizeFormats', 
                    label: 'Standardize Formats', 
                    description: 'Normalize date, phone, and text formats',
                    disabled: selectedOptions.aiMagic
                  },
                  { 
                    key: 'removeOutliers', 
                    label: 'Remove Outliers', 
                    description: 'Detect and handle statistical outliers',
                    disabled: selectedOptions.aiMagic
                  }
                ].map((option) => (
                  <div key={option.key} className="flex items-start space-x-3">
                    <button
                      onClick={option.key === 'aiMagic' ? handleAIMagicChange : () => handleOptionChange(option.key)}
                      disabled={option.disabled}
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                        selectedOptions[option.key]
                          ? 'bg-teal-500 border-teal-500'
                          : option.disabled
                          ? 'bg-gray-400 border-gray-400 cursor-not-allowed'
                          : 'border-gray-600 hover:border-teal-500'
                      }`}
                    >
                      {selectedOptions[option.key] && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <div className={`flex-1 ${option.disabled ? 'opacity-50' : ''}`}>
                      <h4 className={`text-gray-200 font-medium ${option.special ? 'text-teal-400' : ''}`}>
                        {option.label}
                        {option.special && <span className="ml-2 text-xs bg-teal-500 text-white px-2 py-1 rounded">NEW</span>}
                      </h4>
                      <p className="text-gray-400 text-sm">{option.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Missing Value Strategy Selection */}
              {selectedOptions.handleMissing && !selectedOptions.aiMagic && (
                <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <h4 className="text-gray-200 font-medium mb-3">Missing Value Strategy</h4>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="missingStrategy"
                        value="fill"
                        checked={selectedOptions.missingStrategy === 'fill'}
                        onChange={(e) => handleMissingStrategyChange(e.target.value)}
                        className="text-teal-500 focus:ring-teal-500"
                      />
                      <span className="text-gray-200">Fill missing values with '0'</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="missingStrategy"
                        value="remove"
                        checked={selectedOptions.missingStrategy === 'remove'}
                        onChange={(e) => handleMissingStrategyChange(e.target.value)}
                        className="text-teal-500 focus:ring-teal-500"
                      />
                      <span className="text-gray-200">Remove rows with missing values</span>
                    </label>
                  </div>
                </div>
              )}

              {/* AI Magic Info */}
              {selectedOptions.aiMagic && (
                <div className="mt-6 p-4 bg-teal-900/20 border border-teal-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                    <span className="text-teal-400 font-medium">AI Magic Mode Active</span>
                  </div>
                  <p className="text-teal-200 text-sm">
                    AI will intelligently clean your data by analyzing column types and applying the best cleaning strategies automatically.
                  </p>
                  <div className="mt-4">
                    <label htmlFor="ai-instruction" className="text-gray-300 font-medium">
                      Instructions for AI (Optional)
                    </label>
                    <textarea
                      id="ai-instruction"
                      value={aiInstruction}
                      onChange={(e) => setAiInstruction(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 mt-2 text-gray-200 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="e.g., 'remove rows where column X is empty', 'convert column Y to uppercase'"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              )}
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
        </div>
    </div>
  );
};

export default CleaningPage;

