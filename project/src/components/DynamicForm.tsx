import React, { useState, useEffect } from 'react';
import { ActorSchema, SchemaProperty } from '../types/apify';
import { Play, Loader } from 'lucide-react';

interface DynamicFormProps {
  schema: ActorSchema;
  onSubmit: (data: any) => void;
  isRunning: boolean;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ schema, onSubmit, isRunning }) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    // Initialize form data with default values
    const initData: any = {};
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, property]) => {
        if (property.default !== undefined) {
          initData[key] = property.default;
        } else if (property.type === 'boolean') {
          initData[key] = false;
        } else if (property.type === 'array') {
          initData[key] = [];
        }
      });
    }
    setFormData(initData);
  }, [schema]);

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const renderField = (key: string, property: SchemaProperty): JSX.Element => {
    const value = formData[key] || '';
    const isRequired = schema.required?.includes(key) || false;

    const commonProps = {
      id: key,
      disabled: isRunning,
      className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
    };

    switch (property.type) {
      case 'string':
        if (property.enum) {
          return (
            <select
              {...commonProps}
              value={value}
              onChange={(e) => handleInputChange(key, e.target.value)}
            >
              <option value="">Select an option...</option>
              {property.enum.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        return (
          <input
            {...commonProps}
            type="text"
            value={value}
            onChange={(e) => handleInputChange(key, e.target.value)}
            placeholder={property.description || `Enter ${property.title || key}`}
          />
        );

      case 'number':
      case 'integer':
        return (
          <input
            {...commonProps}
            type="number"
            value={value}
            onChange={(e) => handleInputChange(key, parseFloat(e.target.value) || 0)}
            placeholder={property.description || `Enter ${property.title || key}`}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={key}
              checked={value}
              onChange={(e) => handleInputChange(key, e.target.checked)}
              disabled={isRunning}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor={key} className="ml-2 text-sm text-gray-700">
              {property.title || key}
            </label>
          </div>
        );

      case 'array':
        return (
          <textarea
            {...commonProps}
            value={Array.isArray(value) ? value.join('\n') : value}
            onChange={(e) => handleInputChange(key, e.target.value.split('\n').filter(item => item.trim()))}
            placeholder={property.description || "Enter one item per line"}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical"
          />
        );

      default:
        return (
          <textarea
            {...commonProps}
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleInputChange(key, parsed);
              } catch {
                handleInputChange(key, e.target.value);
              }
            }}
            placeholder={property.description || "Enter JSON data"}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical font-mono text-sm"
          />
        );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!schema.properties) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">This actor has no input parameters.</p>
        <button
          onClick={() => onSubmit({})}
          disabled={isRunning}
          className="mt-4 bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center mx-auto"
        >
          {isRunning ? (
            <>
              <Loader className="w-4 h-4 animate-spin mr-2" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Actor
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actor Configuration</h3>
        
        <div className="space-y-4">
          {Object.entries(schema.properties).map(([key, property]) => {
            const isRequired = schema.required?.includes(key) || false;
            
            return (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1">
                  {property.title || key}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </label>
                {property.description && (
                  <p className="text-xs text-gray-500 mb-2">{property.description}</p>
                )}
                {renderField(key, property)}
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={isRunning}
        className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
      >
        {isRunning ? (
          <>
            <Loader className="w-5 h-5 animate-spin mr-2" />
            Running Actor...
          </>
        ) : (
          <>
            <Play className="w-5 h-5 mr-2" />
            Run Actor
          </>
        )}
      </button>
    </form>
  );
};

export default DynamicForm;