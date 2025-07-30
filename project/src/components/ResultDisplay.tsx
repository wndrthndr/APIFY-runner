import React from 'react';
import { ActorRun } from '../types/apify';
import { CheckCircle, XCircle, Clock, Download } from 'lucide-react';

interface ResultDisplayProps {
  result: ActorRun;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const getStatusIcon = () => {
    switch (result.status) {
      case 'SUCCEEDED':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Clock className="w-6 h-6 text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (result.status) {
      case 'SUCCEEDED':
        return 'bg-green-50 border-green-200';
      case 'FAILED':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getStatusText = () => {
    switch (result.status) {
      case 'SUCCEEDED':
        return 'Completed Successfully';
      case 'FAILED':
        return 'Failed';
      case 'RUNNING':
        return 'Running';
      case 'READY':
        return 'Ready';
      default:
        return result.status;
    }
  };

  const downloadResults = () => {
    if (result.output) {
      const dataStr = JSON.stringify(result.output, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `apify-results-${result.runId}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  return (
    <div className="mt-8">
      <div className={`border rounded-lg p-6 ${getStatusColor()}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {getStatusIcon()}
            <h3 className="text-lg font-medium ml-3">Actor Run Results</h3>
          </div>
          <span className="text-sm text-gray-600">Run ID: {result.runId}</span>
        </div>

        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white border">
            Status: {getStatusText()}
          </span>
        </div>

        {result.error && (
          <div className="mb-4 bg-red-100 border border-red-300 rounded-lg p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 mt-1">{result.error}</p>
          </div>
        )}

        {result.message && (
          <div className="mb-4 bg-blue-100 border border-blue-300 rounded-lg p-4">
            <p className="text-blue-700">{result.message}</p>
          </div>
        )}

        {result.output && result.output.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Output Data ({result.output.length} items)</h4>
              <button
                onClick={downloadResults}
                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
              >
                <Download className="w-4 h-4 mr-1" />
                Download JSON
              </button>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-auto">
              <pre className="text-green-400 text-sm">
                {JSON.stringify(result.output, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {result.output && result.output.length === 0 && result.status === 'SUCCEEDED' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-700">The actor completed successfully but returned no data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultDisplay;