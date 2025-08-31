import React from 'react';
import { Plus, FileText, Calendar, Eye } from 'lucide-react';

const ReportPage = ({ setActivePage }) => {
  const mockReports = [
    {
      id: 1,
      title: 'Q4 Sales Analysis',
      date: '2024-12-15',
      thumbnail: 'chart-placeholder',
      description: 'Comprehensive analysis of Q4 sales performance and trends'
    },
    {
      id: 2,
      title: 'Customer Behavior Study',
      date: '2024-12-10',
      thumbnail: 'chart-placeholder',
      description: 'Deep dive into customer purchasing patterns and preferences'
    },
    {
      id: 3,
      title: 'Market Research Report',
      date: '2024-12-05',
      thumbnail: 'chart-placeholder',
      description: 'Analysis of market trends and competitive landscape'
    },
    {
      id: 4,
      title: 'Product Performance Review',
      date: '2024-11-28',
      thumbnail: 'chart-placeholder',
      description: 'Evaluation of product metrics and user engagement'
    },
    {
      id: 5,
      title: 'Financial Dashboard',
      date: '2024-11-20',
      thumbnail: 'chart-placeholder',
      description: 'Monthly financial performance and budget analysis'
    },
    {
      id: 6,
      title: 'User Engagement Metrics',
      date: '2024-11-15',
      thumbnail: 'chart-placeholder',
      description: 'Analysis of user behavior and platform engagement'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-200 mb-2">My Reports</h1>
            <p className="text-gray-400">Manage and view your generated reports</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setActivePage('dashboard')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Go to Dashboard
            </button>
            <button className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
              <Plus className="w-5 h-5" />
              <span>Create New Report</span>
            </button>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockReports.map((report) => (
            <div
              key={report.id}
              className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-teal-500 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10"
            >
              {/* Thumbnail */}
              <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Report Preview</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-200 mb-2">
                  {report.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  {report.description}
                </p>

                {/* Date */}
                <div className="flex items-center text-gray-500 text-sm mb-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{new Date(report.date).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button className="flex-1 flex items-center justify-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-lg transition-colors duration-200">
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button className="px-4 py-2 border border-gray-600 text-gray-300 hover:border-teal-500 hover:text-teal-400 rounded-lg transition-colors duration-200">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (if no reports) */}
        {mockReports.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-200 mb-2">
              No Reports Yet
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Create your first report to get started with data visualization and insights.
            </p>
            <button className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
              Create Your First Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;

