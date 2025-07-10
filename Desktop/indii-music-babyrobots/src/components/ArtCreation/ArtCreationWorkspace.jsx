import React, { useState } from 'react';

const ArtCreationWorkspace = ({ projectId, trackMetadata }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedArt, setGeneratedArt] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const [colorPalette, setColorPalette] = useState('vibrant');
  const [customPrompt, setCustomPrompt] = useState('');

  const steps = [
    { id: 1, name: 'Style Selection', description: 'Choose your art style' },
    { id: 2, name: 'Customization', description: 'Fine-tune your preferences' },
    { id: 3, name: 'Generation', description: 'AI creates your artwork' },
    { id: 4, name: 'Review & Export', description: 'Final touches and download' },
  ];

  const artStyles = [
    { id: 'modern', name: 'Modern', description: 'Clean, contemporary design', preview: '/images/style-modern.jpg' },
    { id: 'vintage', name: 'Vintage', description: 'Retro-inspired aesthetic', preview: '/images/style-vintage.jpg' },
    { id: 'abstract', name: 'Abstract', description: 'Artistic and creative', preview: '/images/style-abstract.jpg' },
    { id: 'minimalist', name: 'Minimalist', description: 'Simple and elegant', preview: '/images/style-minimal.jpg' },
    { id: 'grunge', name: 'Grunge', description: 'Raw and edgy design', preview: '/images/style-grunge.jpg' },
    { id: 'neon', name: 'Neon', description: 'Bright and electric', preview: '/images/style-neon.jpg' },
  ];

  const colorPalettes = [
    { id: 'vibrant', name: 'Vibrant', colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'] },
    { id: 'monochrome', name: 'Monochrome', colors: ['#2C3E50', '#34495E', '#7F8C8D', '#BDC3C7'] },
    { id: 'sunset', name: 'Sunset', colors: ['#FF7675', '#FD79A8', '#FDCB6E', '#E17055'] },
    { id: 'ocean', name: 'Ocean', colors: ['#0984E3', '#74B9FF', '#00B894', '#00CEC9'] },
    { id: 'earth', name: 'Earth', colors: ['#8D6E63', '#A1887F', '#D7CCC8', '#F5F5F5'] },
  ];

  const handleGenerateArt = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation process
    setTimeout(() => {
      setGeneratedArt({
        id: Date.now(),
        url: '/images/generated-art-sample.jpg',
        style: selectedStyle,
        palette: colorPalette,
        prompt: customPrompt
      });
      setIsGenerating(false);
      setCurrentStep(4);
    }, 5000);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Choose Your Art Style</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {artStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedStyle === style.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="w-full h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-md mb-3 flex items-center justify-center">
                    <span className="text-white font-medium">{style.name}</span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900">{style.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{style.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Customize Your Artwork</h3>
            
            {/* Color Palette Selection */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Color Palette</h4>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {colorPalettes.map((palette) => (
                  <button
                    key={palette.id}
                    onClick={() => setColorPalette(palette.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      colorPalette === palette.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex space-x-1 mb-2">
                      {palette.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{palette.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Track Metadata Integration */}
            {trackMetadata && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Track Information</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Title:</strong> {trackMetadata.title}</p>
                  <p><strong>Genre:</strong> {trackMetadata.genre}</p>
                  <p><strong>Mood:</strong> {trackMetadata.mood}</p>
                </div>
              </div>
            )}

            {/* Custom Prompt */}
            <div>
              <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Instructions (Optional)
              </label>
              <textarea
                id="custom-prompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                placeholder="Describe any specific elements you'd like to include..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Generating Your Artwork</h3>
            
            {isGenerating ? (
              <div className="space-y-4">
                <div className="w-64 h-64 mx-auto bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">AI is creating your artwork...</p>
                  <p className="text-sm text-gray-600">This usually takes 2-3 minutes</p>
                  <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={handleGenerateArt}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Generate Artwork
                </button>
                <p className="text-sm text-gray-600">Ready to create your unique artwork</p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Your Generated Artwork</h3>
            
            {generatedArt && (
              <div className="text-center space-y-4">
                <div className="w-80 h-80 mx-auto bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-medium">Generated Artwork</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                    Download HD
                  </button>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                    Generate Variations
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Save to Project
                  </button>
                  <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
                    Share
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Progress Steps */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep >= step.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step.id}
              </div>
              <div className="ml-3 hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{step.name}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 h-0.5 bg-gray-200">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      currentStep > step.id ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                    style={{ width: currentStep > step.id ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="px-6 py-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {currentStep < 3 && (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
          >
            Next
          </button>
        )}
        
        {currentStep === 4 && (
          <button
            onClick={() => {
              setCurrentStep(1);
              setGeneratedArt(null);
              setSelectedStyle('modern');
              setColorPalette('vibrant');
              setCustomPrompt('');
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
          >
            Create New
          </button>
        )}
      </div>
    </div>
  );
};

export default ArtCreationWorkspace;
