import React, { useState } from 'react';

const ArtCreationWidget = ({ userId, activeProject, onProjectChange }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = [
    { id: 1, name: 'Album Cover', description: 'Perfect for album releases', preview: '/images/template-album.jpg' },
    { id: 2, name: 'Single Artwork', description: 'Ideal for single releases', preview: '/images/template-single.jpg' },
    { id: 3, name: 'Social Media', description: 'Optimized for social platforms', preview: '/images/template-social.jpg' },
    { id: 4, name: 'Playlist Cover', description: 'Custom playlist artwork', preview: '/images/template-playlist.jpg' },
  ];

  const recentProjects = [
    { id: 1, name: 'Summer Vibes EP', status: 'completed', thumbnail: '/images/project1.jpg' },
    { id: 2, name: 'Midnight Dreams', status: 'in_progress', thumbnail: '/images/project2.jpg' },
    { id: 3, name: 'Acoustic Sessions', status: 'draft', thumbnail: '/images/project3.jpg' },
  ];

  const handleCreateNew = async (templateId) => {
    setIsCreating(true);
    setSelectedTemplate(templateId);
    
    // Simulate AI generation process
    setTimeout(() => {
      setIsCreating(false);
      onProjectChange({ id: Date.now(), template: templateId, status: 'draft' });
    }, 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Art Creation Studio</h3>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm">
          View All
        </button>
      </div>

      {/* AI Generation Status */}
      {isCreating && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-900">AI is creating your artwork...</p>
              <p className="text-xs text-purple-700">This usually takes 30-60 seconds</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Templates */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Start Templates</h4>
        <div className="grid grid-cols-2 gap-3">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleCreateNew(template.id)}
              disabled={isCreating}
              className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-full h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-md mb-2 flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h5 className="text-xs font-medium text-gray-900">{template.name}</h5>
              <p className="text-xs text-gray-500 mt-1">{template.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Projects</h4>
        <div className="space-y-3">
          {recentProjects.map((project) => (
            <div key={project.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-md flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{project.name}</p>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    project.status === 'completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Features Highlight */}
      <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="ml-3">
            <h5 className="text-sm font-medium text-indigo-900">AI-Powered Features</h5>
            <p className="text-xs text-indigo-700 mt-1">
              Generate artwork from track metadata, mood analysis, and genre optimization
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtCreationWidget;
