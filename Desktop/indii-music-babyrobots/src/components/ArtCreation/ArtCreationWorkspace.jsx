import React, { useState, useEffect } from 'react';
import VanillaTilt from 'vanilla-tilt';
import { 
  PaintBrushIcon, 
  SwatchIcon, 
  SparklesIcon,
  UserGroupIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  PlayIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const ArtCreationWorkspace = ({ projectId, trackMetadata }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedArt, setGeneratedArt] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const [colorPalette, setColorPalette] = useState('vibrant');
  const [customPrompt, setCustomPrompt] = useState('');
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: 'Alex Chen', role: 'Designer', avatar: '👨‍🎨', status: 'online' },
    { id: 2, name: 'Maya Rodriguez', role: 'Art Director', avatar: '👩‍🎨', status: 'away' }
  ]);
  const [comments, setComments] = useState([
    { id: 1, user: 'Alex Chen', text: 'Love the vibrant colors! Maybe try a darker background?', time: '2 min ago' },
    { id: 2, user: 'Maya Rodriguez', text: 'This style fits the track perfectly', time: '5 min ago' }
  ]);
  const [newComment, setNewComment] = useState('');
  const [versionHistory, setVersionHistory] = useState([
    { id: 1, version: 'v1.0', user: 'You', time: '10 min ago', thumbnail: '🎨' },
    { id: 2, version: 'v1.1', user: 'Alex Chen', time: '5 min ago', thumbnail: '🖼️' }
  ]);

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

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, {
        id: Date.now(),
        user: 'You',
        text: newComment,
        time: 'just now'
      }]);
      setNewComment('');
    }
  };

  // Initialize VanillaTilt effects
  useEffect(() => {
    const initializeTilt = () => {
      const tiltElements = document.querySelectorAll('.art-tilt');
      tiltElements.forEach(el => {
        VanillaTilt.init(el, {
          max: 10,
          speed: 400,
          glare: true,
          'max-glare': 0.2,
          perspective: 1000,
          scale: 1.02
        });
      });
    };

    const timer = setTimeout(initializeTilt, 100);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <PaintBrushIcon className="h-6 w-6 text-electric-400" />
              <h3 className="text-xl font-semibold text-white">Choose Your Art Style</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {artStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`art-tilt p-4 rounded-lg border-2 transition-all duration-300 ${
                    selectedStyle === style.id
                      ? 'border-electric-500 bg-electric-500/10'
                      : 'border-technical-700 hover:border-electric-400 bg-studio-800'
                  }`}
                >
                  <div className={`w-full h-32 rounded-md mb-3 flex items-center justify-center ${
                    style.id === 'modern' ? 'bg-gradient-to-br from-electric-400 to-electric-600' :
                    style.id === 'vintage' ? 'bg-gradient-to-br from-amber-400 to-orange-600' :
                    style.id === 'abstract' ? 'bg-gradient-to-br from-purple-400 to-pink-600' :
                    style.id === 'minimalist' ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                    style.id === 'grunge' ? 'bg-gradient-to-br from-stone-600 to-zinc-800' :
                    'bg-gradient-to-br from-cyan-400 to-blue-600'
                  }`}>
                    <span className="text-white font-medium">{style.name}</span>
                  </div>
                  <h4 className="text-sm font-medium text-white">{style.name}</h4>
                  <p className="text-xs text-technical-400 mt-1">{style.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <SwatchIcon className="h-6 w-6 text-electric-400" />
              <h3 className="text-xl font-semibold text-white">Customize Your Artwork</h3>
            </div>
            
            {/* Color Palette Selection */}
            <div>
              <h4 className="text-sm font-medium text-technical-400 mb-3">Color Palette</h4>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {colorPalettes.map((palette) => (
                  <button
                    key={palette.id}
                    onClick={() => setColorPalette(palette.id)}
                    className={`art-tilt p-3 rounded-lg border-2 transition-all duration-300 ${
                      colorPalette === palette.id
                        ? 'border-electric-500 bg-electric-500/10'
                        : 'border-technical-700 hover:border-electric-400 bg-studio-800'
                    }`}
                  >
                    <div className="flex space-x-1 mb-2">
                      {palette.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border border-technical-600"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-white">{palette.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Track Metadata Integration */}
            {trackMetadata && (
              <div className="bg-studio-800 border border-technical-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-technical-400 mb-2">Track Information</h4>
                <div className="text-sm text-white space-y-1">
                  <p><strong className="text-electric-400">Title:</strong> {trackMetadata.title}</p>
                  <p><strong className="text-electric-400">Genre:</strong> {trackMetadata.genre}</p>
                  <p><strong className="text-electric-400">Mood:</strong> {trackMetadata.mood}</p>
                </div>
              </div>
            )}

            {/* Custom Prompt */}
            <div>
              <label htmlFor="custom-prompt" className="block text-sm font-medium text-technical-400 mb-2">
                Additional Instructions (Optional)
              </label>
              <textarea
                id="custom-prompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full px-3 py-2 bg-studio-800 border border-technical-700 rounded-md text-white placeholder-technical-500 focus:outline-none focus:ring-2 focus:ring-electric-500 focus:border-electric-500"
                rows={3}
                placeholder="Describe any specific elements you'd like to include..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <SparklesIcon className="h-6 w-6 text-electric-400" />
              <h3 className="text-xl font-semibold text-white">Generating Your Artwork</h3>
            </div>
            
            {isGenerating ? (
              <div className="space-y-4">
                <div className="w-64 h-64 mx-auto bg-gradient-to-br from-electric-400 to-electric-600 rounded-lg flex items-center justify-center art-tilt">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-white">AI is creating your artwork...</p>
                  <p className="text-sm text-technical-400">This usually takes 2-3 minutes</p>
                  <div className="w-64 mx-auto bg-technical-700 rounded-full h-2">
                    <div className="bg-electric-400 h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={handleGenerateArt}
                  className="bg-electric-500 text-white px-8 py-3 rounded-lg hover:bg-electric-600 transition-colors font-medium shadow-lg"
                >
                  <SparklesIcon className="h-5 w-5 inline mr-2" />
                  Generate Artwork
                </button>
                <p className="text-sm text-technical-400">Ready to create your unique artwork</p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <DocumentDuplicateIcon className="h-6 w-6 text-electric-400" />
              <h3 className="text-xl font-semibold text-white">Your Generated Artwork</h3>
            </div>
            
            {generatedArt && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-80 h-80 mx-auto bg-gradient-to-br from-electric-400 to-electric-600 rounded-lg flex items-center justify-center art-tilt shadow-2xl">
                    <span className="text-white text-xl font-medium">Generated Artwork</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <button className="bg-audio-levels text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center space-x-2">
                    <span>📥</span><span>Download HD</span>
                  </button>
                  <button className="bg-electric-500 text-white px-4 py-2 rounded-md hover:bg-electric-600 transition-colors flex items-center justify-center space-x-2">
                    <SparklesIcon className="h-4 w-4" /><span>Variations</span>
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <span>💾</span><span>Save to Project</span>
                  </button>
                  <button className="bg-technical-600 text-white px-4 py-2 rounded-md hover:bg-technical-500 transition-colors flex items-center justify-center space-x-2">
                    <ShareIcon className="h-4 w-4" /><span>Share</span>
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
    <div className="h-full flex bg-studio-900">
      {/* Main Art Creation Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-studio-800 border-b border-technical-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <PaintBrushIcon className="h-8 w-8 text-electric-400" />
              <div>
                <h1 className="text-xl font-semibold text-white">Art Creation Studio</h1>
                <p className="text-sm text-technical-400">AI-powered artwork generation</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-3 py-2 bg-electric-500/20 text-electric-400 rounded-lg hover:bg-electric-500/30 transition-colors">
                <UserGroupIcon className="h-4 w-4" />
                <span className="text-sm">Collaborators ({collaborators.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-studio-800 border-b border-technical-700 px-6 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all ${
                  currentStep >= step.id
                    ? 'bg-electric-500 text-white shadow-lg'
                    : 'bg-technical-700 text-technical-400'
                }`}>
                  {step.id}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className="text-sm font-medium text-white">{step.name}</p>
                  <p className="text-xs text-technical-400">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4 h-1 bg-technical-700 rounded-full">
                    <div 
                      className={`h-full transition-all duration-300 rounded-full ${
                        currentStep > step.id ? 'bg-electric-400' : 'bg-technical-700'
                      }`}
                      style={{ width: currentStep > step.id ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {renderStepContent()}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-studio-800 border-t border-technical-700 px-6 py-4 flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-2 text-sm font-medium text-technical-400 bg-technical-700 rounded-lg hover:bg-technical-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          {currentStep < 3 && (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2 text-sm font-medium text-white bg-electric-500 rounded-lg hover:bg-electric-600 transition-colors shadow-lg"
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
              className="px-6 py-2 text-sm font-medium text-white bg-electric-500 rounded-lg hover:bg-electric-600 transition-colors shadow-lg"
            >
              Create New
            </button>
          )}
        </div>
      </div>

      {/* Collaboration Sidebar */}
      <div className="w-80 bg-studio-800 border-l border-technical-700 flex flex-col">
        {/* Collaborators */}
        <div className="p-4 border-b border-technical-700">
          <div className="flex items-center space-x-2 mb-3">
            <UserGroupIcon className="h-5 w-5 text-electric-400" />
            <h3 className="text-sm font-semibold text-white">Team</h3>
          </div>
          <div className="space-y-2">
            {collaborators.map((collaborator) => (
              <div key={collaborator.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-studio-700 transition-colors">
                <div className="w-8 h-8 flex items-center justify-center bg-electric-500/20 rounded-full">
                  <span className="text-sm">{collaborator.avatar}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{collaborator.name}</p>
                  <p className="text-xs text-technical-400">{collaborator.role}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  collaborator.status === 'online' ? 'bg-audio-levels' : 'bg-audio-warning'
                }`} />
              </div>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div className="flex-1 flex flex-col p-4 border-b border-technical-700">
          <div className="flex items-center space-x-2 mb-3">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-electric-400" />
            <h3 className="text-sm font-semibold text-white">Comments</h3>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="p-3 bg-studio-700 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-electric-400">{comment.user}</span>
                  <span className="text-xs text-technical-500">{comment.time}</span>
                </div>
                <p className="text-sm text-white">{comment.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 bg-studio-700 border border-technical-600 rounded-lg text-white placeholder-technical-500 text-sm focus:outline-none focus:ring-2 focus:ring-electric-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                className="px-3 py-2 bg-electric-500 text-white rounded-lg hover:bg-electric-600 transition-colors"
              >
                💬
              </button>
            </div>
          </div>
        </div>

        {/* Version History */}
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <ClockIcon className="h-5 w-5 text-electric-400" />
            <h3 className="text-sm font-semibold text-white">Version History</h3>
          </div>
          <div className="space-y-2">
            {versionHistory.map((version) => (
              <div key={version.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-studio-700 transition-colors cursor-pointer">
                <div className="w-8 h-8 flex items-center justify-center bg-technical-700 rounded">
                  <span className="text-sm">{version.thumbnail}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{version.version}</p>
                  <p className="text-xs text-technical-400">{version.user} • {version.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtCreationWorkspace;
