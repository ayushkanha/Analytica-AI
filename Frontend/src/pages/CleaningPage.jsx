import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { 
    Upload, 
    Check, 
    Loader2, 
    Sparkles, 
    Copy, 
    AlertCircle, 
    AlignJustify, 
    BarChart3, 
    ArrowLeft, 
    ArrowRight 
} from 'lucide-react';

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/process`, {
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
    <div className="bg-[#0a0a0a] text-gray-100 min-h-screen">
    
        {/* Header */}
        <div className="border-b border-gray-800 pb-19">
            <div></div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            
            {/* Page Title */}
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">Upload Your Data</h1>
                <p className="text-gray-400 text-sm sm:text-base">Upload your CSV or Excel file to clean and process your data</p>
            </div>

            {/* Upload Section */}
            <div className="mb-8">
                <div 
                  className={`bg-[#111111] border rounded-lg p-8 sm:p-12 hover:border-gray-700 transition-colors ${
                    isDragOver 
                      ? 'border-teal-400 bg-teal-900/20' 
                      : 'border-gray-800'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                    <input 
                      type="file" 
                      id="fileInput" 
                      accept=".csv,.xlsx,.xls" 
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && isValidFileType(file)) {
                          handleFileUpload(file);
                        } else if (file) {
                          alert('Please upload a valid CSV or Excel file.');
                        }
                      }}
                    />
                    <label htmlFor="fileInput" className="cursor-pointer block text-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
                                <Upload className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-base font-medium mb-1">
                                  {isDragOver ? 'Drop your file here!' : 'Click to upload or drag and drop'}
                                </p>
                                <p className="text-sm text-gray-500">CSV or Excel files (MAX. 50MB)</p>
                            </div>
                            <button 
                              type="button" 
                              className="px-4 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
                              onClick={() => document.getElementById('fileInput').click()}
                            >
                                Browse Files
                            </button>
                        </div>
                    </label>
                </div>
            </div>

            {/* Error Display (From old code) */}
            {parsedData && parsedData.error && (
              <div className="mb-8 bg-red-900/20 border border-red-500/30 rounded-lg p-6">
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

            {/* Data Preview Section */}
            {parsedData && parsedData.rows && parsedData.rows.length > 0 && (
              <div className="mb-8">
                  <div className="bg-[#111111] border border-gray-800 rounded-lg overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-800">
                          <div className="flex items-center justify-between">
                              <h2 className="text-lg font-semibold">Data Preview</h2>
                              <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">
                                {parsedData.rows.length} rows × {parsedData.headers.length} columns
                              </span>
                          </div>
                      </div>
                      <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                              <thead className="bg-[#0a0a0a] border-b border-gray-800">
                                  <tr>
                                    {parsedData.headers.map((header, index) => (
                                      <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {header}
                                      </th>
                                    ))}
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-800">
                                {parsedData.rows.slice(0, 5).map((row, rowIndex) => (
                                  <tr key={rowIndex} className="hover:bg-[#0a0a0a] transition-colors">
                                    {parsedData.headers.map((header, colIndex) => (
                                      <td key={colIndex} className="px-6 py-4 text-gray-300">
                                        {row[header] || '—'}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
            )}

            {/* Cleaning Options */}
            <div className="mb-8">
                <div className="bg-[#111111] border border-gray-800 rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-6">Cleaning Options</h2>
                    
                    <div className="space-y-4">
                        {/* AI Magic Option */}
                        <label className="flex items-start gap-4 p-4 rounded-lg border border-gray-800 hover:border-gray-700 hover:bg-[#0a0a0a] transition-all cursor-pointer group">
                            <div className="flex items-center h-5 mt-0.5">
                                <input 
                                  type="checkbox" 
                                  name="cleaningOption" 
                                  value="ai-magic" 
                                  className="w-4 h-4 bg-transparent border-gray-600 text-white focus:ring-white focus:ring-offset-0 focus:ring-2"
                                  checked={selectedOptions.aiMagic}
                                  onChange={handleAIMagicChange}
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
                                    <span className="font-medium text-sm">AI Magic</span>
                                    <span className="text-xs text-[#FFFFFF] bg-[#007bff] px-2 py-0.5 rounded">Recommended</span>
                                </div>
                                <p className="text-xs text-gray-500">Let AI automatically detect and fix all issues in your data</p>
                            </div>
                        </label>

                        {/* Duplicate Values Option */}
                        <label className={`flex items-start gap-4 p-4 rounded-lg border border-gray-800 hover:border-gray-700 hover:bg-[#0a0a0a] transition-all group ${selectedOptions.aiMagic ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <div className="flex items-center h-5 mt-0.5">
                                <input 
                                  type="checkbox" 
                                  name="cleaningOption" 
                                  value="duplicates" 
                                  className="w-4 h-4 bg-transparent border-gray-600 text-white focus:ring-white focus:ring-offset-0 focus:ring-2"
                                  checked={selectedOptions.removeDuplicates}
                                  onChange={() => handleOptionChange('removeDuplicates')}
                                  disabled={selectedOptions.aiMagic}
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
                                    <span className="font-medium text-sm">Duplicate Values</span>
                                </div>
                                <p className="text-xs text-gray-500">Remove or flag duplicate rows based on selected columns</p>
                            </div>
                        </label>

                        {/* Missing Values Option */}
                        <label className={`flex items-start gap-4 p-4 rounded-lg border border-gray-800 hover:border-gray-700 hover:bg-[#0a0a0a] transition-all group ${selectedOptions.aiMagic ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <div className="flex items-center h-5 mt-0.5">
                                <input 
                                  type="checkbox" 
                                  name="cleaningOption" 
                                  value="missing" 
                                  className="w-4 h-4 bg-transparent border-gray-600 text-white focus:ring-white focus:ring-offset-0 focus:ring-2"
                                  checked={selectedOptions.handleMissing}
                                  onChange={() => handleOptionChange('handleMissing')}
                                  disabled={selectedOptions.aiMagic}
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertCircle className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
                                    <span className="font-medium text-sm">Missing Values</span>
                                </div>
                                <p className="text-xs text-gray-500">Handle empty cells with imputation or removal strategies</p>
                            </div>
                        </label>

                        {/* Standardization Option */}
                        <label className={`flex items-start gap-4 p-4 rounded-lg border border-gray-800 hover:border-gray-700 hover:bg-[#0a0a0a] transition-all group ${selectedOptions.aiMagic ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <div className="flex items-center h-5 mt-0.5">
                                <input 
                                  type="checkbox" 
                                  name="cleaningOption" 
                                  value="standardization" 
                                  className="w-4 h-4 bg-transparent border-gray-600 text-white focus:ring-white focus:ring-offset-0 focus:ring-2"
                                  checked={selectedOptions.standardizeFormats}
                                  onChange={() => handleOptionChange('standardizeFormats')}
                                  disabled={selectedOptions.aiMagic}
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlignJustify className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
                                    <span className="font-medium text-sm">Standardization</span>
                                </div>
                                <p className="text-xs text-gray-500">Normalize data formats, units, and text casing</p>
                            </div>
                        </label>

                        {/* Outliers Option */}
                        <label className={`flex items-start gap-4 p-4 rounded-lg border border-gray-800 hover:border-gray-700 hover:bg-[#0a0a0a] transition-all group ${selectedOptions.aiMagic ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <div className="flex items-center h-5 mt-0.5">
                                <input 
                                  type="checkbox" 
                                  name="cleaningOption" 
                                  value="outliers" 
                                  className="w-4 h-4 bg-transparent border-gray-600 text-white focus:ring-white focus:ring-offset-0 focus:ring-2"
                                  checked={selectedOptions.removeOutliers}
                                  onChange={() => handleOptionChange('removeOutliers')}
                                  disabled={selectedOptions.aiMagic}
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <BarChart3 className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
                                    <span className="font-medium text-sm">Outliers</span>
                                </div>
                                <p className="text-xs text-gray-500">Detect and handle statistical outliers in numerical data</p>
                            </div>
                        </label>
                    </div>

                    {/* Missing Value Strategy Selection (From old code) */}
                    {selectedOptions.handleMissing && !selectedOptions.aiMagic && (
                      <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
                        <h4 className="text-gray-200 font-medium mb-3">Missing Value Strategy</h4>
                        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="missingStrategy"
                              value="fill"
                              checked={selectedOptions.missingStrategy === 'fill'}
                              onChange={(e) => handleMissingStrategyChange(e.target.value)}
                              className="text-white focus:ring-white bg-transparent border-gray-600"
                            />
                            <span className="text-gray-200 text-sm">Fill missing values (e.g., with '0' or mean)</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="missingStrategy"
                              value="remove"
                              checked={selectedOptions.missingStrategy === 'remove'}
                              onChange={(e) => handleMissingStrategyChange(e.target.value)}
                              className="text-white focus:ring-white bg-transparent border-gray-600"
                            />
                            <span className="text-gray-200 text-sm">Remove rows with missing values</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* AI Magic Info (From old code) */}
                    {selectedOptions.aiMagic && (
                      <div className="mt-6 p-4 bg-[#111112] border border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Sparkles className="w-4 h-4 text-teal-400" />
                          <span className="text-teal-400 font-medium">AI Magic Mode Active</span>
                        </div>
                        <p className="text-gray-300 text-sm">
                          AI will intelligently clean your data. You can add specific instructions below.
                        </p>
                        <div className="mt-4">
                          <label htmlFor="ai-instruction" className="text-gray-300 font-medium text-sm">
                            Instructions for AI (Optional)
                          </label>
                          <textarea
                            id="ai-instruction"
                            value={aiInstruction}
                            onChange={(e) => setAiInstruction(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 mt-2 text-gray-200 focus:ring-white focus:border-gray-500"
                            placeholder="e.g., 'remove rows where column X is empty', 'convert column Y to uppercase'"
                            rows="3"
                          ></textarea>
                        </div>
                      </div>
                    )}

                </div>
            </div>

            {/* Process Button */}
            <div className="flex items-center justify-between gap-4">
                <button 
                  className="text-sm text-gray-400 hover:text-gray-100 transition-colors flex items-center gap-2"
                  onClick={() => setActivePage('chat')} // Assumes 'chat' is the previous page
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <button 
                  className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleProcess}
                  disabled={isProcessing || !parsedData || parsedData.rows.length === 0}
                >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Process Data
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                </button>
            </div>

        </div>

        {/* Loading Screen (From old code) */}
        {isProcessing && (
          <div className="fixed inset-0 bg-[#111111] backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 max-w-md mx-4 text-center ">
              
              <div className="w-32 h-32 relative flex items-center justify-center mx-auto mb-4">
                <div
                  className="absolute inset-0 rounded-xl bg-blue-500/20 blur-xl animate-pulse"
                ></div>

                <div className="w-full h-full relative flex items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-spin blur-sm"
                  ></div>

                  <div
                    className="absolute inset-1 bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden"
                  >
                    <div className="flex gap-1 items-center">
                      <div
                        className="w-1.5 h-12 bg-cyan-500 rounded-full animate-[bounce_1s_ease-in-out_infinite]"
                      ></div>
                      <div
                        className="w-1.5 h-12 bg-blue-500 rounded-full animate-[bounce_1s_ease-in-out_infinite_0.1s]"
                      ></div>
                      <div
                        className="w-1.5 h-12 bg-indigo-500 rounded-full animate-[bounce_1s_ease-in-out_infinite_0.2s]"
                      ></div>
                      <div
                        className="w-1.5 h-12 bg-purple-500 rounded-full animate-[bounce_1s_ease-in-out_infinite_0.3s]"
                      ></div>
                    </div>

                    <div
                      className="absolute inset-0 bg-gradient-to-t from-transparent via-blue-500/10 to-transparent animate-pulse"
                    ></div>
                  </div>
                </div>

                <div
                  className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full animate-ping"
                ></div>
                <div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-ping delay-100"
                ></div>
                <div
                  className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyan-500 rounded-full animate-ping delay-200"
                ></div>
                <div
                  className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping delay-300"
                ></div>
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
  );
};

export default CleaningPage;