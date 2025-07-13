import React, { useState } from 'react';

const FrankenUIDemo = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Franken UI Components</h2>
        <p className="text-gray-400">Demonstrating UI Kit components in your music app</p>
      </div>

      {/* Buttons Section */}
      <div className="uk-card uk-card-default uk-card-body uk-theme-zinc dark">
        <h3 className="uk-card-title text-white">Buttons</h3>
        <div className="uk-flex uk-flex-wrap uk-flex-middle uk-child-width-auto uk-grid-small" uk-grid="">
          <div>
            <button className="uk-btn uk-btn-default">Default</button>
          </div>
          <div>
            <button className="uk-btn uk-btn-primary">Primary</button>
          </div>
          <div>
            <button className="uk-btn uk-btn-secondary">Secondary</button>
          </div>
          <div>
            <button className="uk-btn uk-btn-destructive">Destructive</button>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="uk-grid-match uk-child-width-1-3@m" uk-grid="">
        <div>
          <div className="uk-card uk-card-default uk-card-body uk-theme-zinc dark">
            <h3 className="uk-card-title text-white">Track Analytics</h3>
            <p className="text-gray-300">Your latest track has gained 2,543 plays this week with an engagement rate of 94%.</p>
            <button className="uk-btn uk-btn-primary uk-btn-sm">View Details</button>
          </div>
        </div>
        <div>
          <div className="uk-card uk-card-primary uk-card-body">
            <h3 className="uk-card-title">AI Mastering</h3>
            <p>Upload your track for AI-powered mastering that rivals professional studios.</p>
            <button className="uk-btn uk-btn-secondary uk-btn-sm">Start Mastering</button>
          </div>
        </div>
        <div>
          <div className="uk-card uk-card-secondary uk-card-body">
            <h3 className="uk-card-title">Revenue Report</h3>
            <p>Monthly earnings: $1,247.82 across all platforms with a 15% increase.</p>
            <button className="uk-btn uk-btn-primary uk-btn-sm">Full Report</button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="uk-card uk-card-default uk-card-body uk-theme-zinc dark">
        <h3 className="uk-card-title text-white">Music Projects</h3>
        <ul className="uk-tab" uk-tab="">
          <li className={activeTab === 0 ? "uk-active" : ""}>
            <a href="#" onClick={(e) => {e.preventDefault(); setActiveTab(0);}}>In Progress</a>
          </li>
          <li className={activeTab === 1 ? "uk-active" : ""}>
            <a href="#" onClick={(e) => {e.preventDefault(); setActiveTab(1);}}>Completed</a>
          </li>
          <li className={activeTab === 2 ? "uk-active" : ""}>
            <a href="#" onClick={(e) => {e.preventDefault(); setActiveTab(2);}}>Releases</a>
          </li>
        </ul>

        <ul className="uk-switcher uk-margin">
          <li className={activeTab === 0 ? "" : "uk-hidden"}>
            <div className="space-y-3">
              <div className="uk-alert-primary" uk-alert="">
                <a className="uk-alert-close" uk-close=""></a>
                <p><strong>New Track:</strong> "Midnight Dreams" - Currently in mixing phase</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                <span className="text-white">"Electric Sunrise"</span>
                <span className="uk-badge uk-badge-secondary">Mastering</span>
              </div>
            </div>
          </li>
          <li className={activeTab === 1 ? "" : "uk-hidden"}>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                <span className="text-white">"Ocean Waves"</span>
                <span className="uk-badge uk-badge-primary">Released</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                <span className="text-white">"City Lights"</span>
                <span className="uk-badge uk-badge-primary">Released</span>
              </div>
            </div>
          </li>
          <li className={activeTab === 2 ? "" : "uk-hidden"}>
            <div className="space-y-3">
              <div className="uk-alert-destructive" uk-alert="">
                <a className="uk-alert-close" uk-close=""></a>
                <p><strong>Upcoming:</strong> Album "Digital Dreams" releases in 2 weeks</p>
              </div>
            </div>
          </li>
        </ul>
      </div>

      {/* Accordion Section */}
      <div className="uk-card uk-card-default uk-card-body uk-theme-zinc dark">
        <h3 className="uk-card-title text-white">FAQ</h3>
        <ul uk-accordion="">
          <li className={accordionOpen ? "uk-open" : ""}>
            <a className="uk-accordion-title" href="#" onClick={(e) => {e.preventDefault(); setAccordionOpen(!accordionOpen);}}>
              How does AI mastering work?
            </a>
            <div className="uk-accordion-content">
              <p className="text-gray-300">Our AI analyzes your track's frequency spectrum, dynamics, and stereo imaging to apply professional mastering techniques automatically. The process takes just minutes and rivals studio-quality results.</p>
            </div>
          </li>
          <li>
            <a className="uk-accordion-title" href="#">What platforms do you distribute to?</a>
            <div className="uk-accordion-content">
              <p className="text-gray-300">We distribute to over 150 platforms including Spotify, Apple Music, Amazon Music, YouTube Music, and many more.</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Progress and Badges */}
      <div className="uk-card uk-card-default uk-card-body uk-theme-zinc dark">
        <h3 className="uk-card-title text-white">Current Goals</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Album Completion</span>
              <span className="uk-badge uk-badge-primary">78%</span>
            </div>
            <progress className="uk-progress" value="78" max="100"></progress>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Monthly Streams Goal</span>
              <span className="uk-badge uk-badge-secondary">92%</span>
            </div>
            <progress className="uk-progress" value="92" max="100"></progress>
          </div>
        </div>
      </div>

      {/* Modal Trigger */}
      <div className="uk-card uk-card-default uk-card-body uk-theme-zinc dark">
        <h3 className="uk-card-title text-white">Quick Actions</h3>
        <button 
          className="uk-btn uk-btn-primary"
          onClick={() => setModalOpen(true)}
        >
          Upload New Track
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="uk-modal uk-open" uk-modal="" style={{display: 'block'}}>
          <div className="uk-modal-dialog uk-modal-body uk-theme-zinc dark">
            <h2 className="uk-modal-title text-white">Upload New Track</h2>
            <p className="text-gray-300">Select your audio file to begin the upload process.</p>
            <div className="uk-margin">
              <div uk-form-custom="target: true">
                <input type="file" accept="audio/*" />
                <input className="uk-input" type="text" placeholder="Select file..." disabled />
              </div>
            </div>
            <p className="uk-text-right">
              <button 
                className="uk-btn uk-btn-default uk-modal-close" 
                type="button"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button className="uk-btn uk-btn-primary" type="button">Upload</button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrankenUIDemo;
