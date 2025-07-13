import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Card, Badge, Button, Input, Modal, Avatar } from './ui';
import {
  UserIcon,
  CameraIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const ProfileManager = ({ userId, currentUser, userRole, onProfileUpdate }) => {
  const [activeProfile, setActiveProfile] = useState(userRole || 'artist');
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const profileTypes = [
    { id: 'artist', name: 'Artist', icon: '🎵', description: 'Musicians and performers' },
    { id: 'fan', name: 'Fan', icon: '❤️', description: 'Music enthusiasts' },
    { id: 'licensor', name: 'Licensor', icon: '📜', description: 'Rights holders' },
    { id: 'serviceProvider', name: 'Service Provider', icon: '🛠️', description: 'Industry professionals' }
  ];

  const [formData, setFormData] = useState({
    artist: {
      stageName: '',
      legalName: '',
      bio: '',
      website: '',
      proAffiliation: '',
      ipiNumber: '',
      socialLinks: {},
      profileImageUrl: ''
    },
    fan: {
      displayName: '',
      bio: '',
      favoriteGenres: [],
      profileImageUrl: ''
    },
    licensor: {
      companyName: '',
      contactName: '',
      bio: '',
      website: '',
      profileImageUrl: ''
    },
    serviceProvider: {
      companyName: '',
      services: [],
      bio: '',
      website: '',
      contactEmail: '',
      profileImageUrl: ''
    }
  });

  useEffect(() => {
    if (userId) {
      fetchAllProfiles();
    }
  }, [userId]);

  const fetchAllProfiles = async () => {
    setLoading(true);
    try {
      const promises = profileTypes.map(async (type) => {
        try {
          const response = await fetch(`/api/profiles/${type.id}?userId=${userId}`);
          if (response.ok) {
            const data = await response.json();
            return { type: type.id, profile: data.profile };
          }
          return { type: type.id, profile: null };
        } catch (error) {
          console.warn(`Failed to fetch ${type.id} profile:`, error);
          return { type: type.id, profile: null };
        }
      });

      const results = await Promise.all(promises);
      const profilesData = {};
      
      results.forEach(({ type, profile }) => {
        profilesData[type] = profile;
        if (profile) {
          setFormData(prev => ({
            ...prev,
            [type]: { ...prev[type], ...profile }
          }));
        }
      });

      setProfiles(profilesData);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setMessage('Error loading profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    setUploadingImage(true);
    try {
      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('userId', userId);
      uploadData.append('type', 'profile');

      const response = await fetch('/api/audio/upload', {
        method: 'POST',
        body: uploadData,
      });

      const data = await response.json();

      if (response.ok && data.fileUrl) {
        // Update form data with new image URL
        setFormData(prev => ({
          ...prev,
          [activeProfile]: {
            ...prev[activeProfile],
            profileImageUrl: data.fileUrl
          }
        }));
        setMessage('Profile image uploaded successfully!');
        setShowImageModal(false);
      } else {
        setMessage('Failed to upload image: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage('Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage('');

    try {
      const profileData = formData[activeProfile];
      const response = await fetch(`/api/profiles/${activeProfile}`, {
        method: profiles[activeProfile] ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          profileData,
          updateData: profileData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`${activeProfile} profile ${profiles[activeProfile] ? 'updated' : 'created'} successfully!`);
        await fetchAllProfiles(); // Refresh profiles
        if (onProfileUpdate) {
          onProfileUpdate(activeProfile, data.profile);
        }
      } else {
        setMessage(`Failed to save profile: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  const renderProfileForm = () => {
    const currentFormData = formData[activeProfile];
    
    switch (activeProfile) {
      case 'artist':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Stage Name"
                value={currentFormData.stageName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  artist: { ...prev.artist, stageName: e.target.value }
                }))}
                required
              />
              <Input
                label="Legal Name"
                value={currentFormData.legalName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  artist: { ...prev.artist, legalName: e.target.value }
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                value={currentFormData.bio}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  artist: { ...prev.artist, bio: e.target.value }
                }))}
                rows={4}
                className="input"
                placeholder="Tell us about your music and career..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Website"
                type="url"
                value={currentFormData.website}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  artist: { ...prev.artist, website: e.target.value }
                }))}
              />
              <Input
                label="PRO Affiliation"
                value={currentFormData.proAffiliation}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  artist: { ...prev.artist, proAffiliation: e.target.value }
                }))}
                placeholder="ASCAP, BMI, SESAC, etc."
              />
            </div>
            <Input
              label="IPI Number"
              value={currentFormData.ipiNumber}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                artist: { ...prev.artist, ipiNumber: e.target.value }
              }))}
            />
          </div>
        );

      case 'fan':
        return (
          <div className="space-y-4">
            <Input
              label="Display Name"
              value={currentFormData.displayName}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                fan: { ...prev.fan, displayName: e.target.value }
              }))}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                value={currentFormData.bio}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  fan: { ...prev.fan, bio: e.target.value }
                }))}
                rows={3}
                className="input"
                placeholder="Tell us about your music taste..."
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Profile form for {activeProfile} coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-studio-900 text-white min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Management</h1>
          <p className="text-technical-400">Manage your profiles across different roles</p>
        </div>

        {/* Profile Type Selector */}
        <Card className="bg-studio-800 border-technical-700 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Select Profile Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {profileTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveProfile(type.id)}
                className={clsx(
                  "p-4 rounded-lg border-2 transition-all duration-200 text-left",
                  activeProfile === type.id
                    ? "border-electric-500 bg-electric-500/10"
                    : "border-technical-600 hover:border-technical-500"
                )}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{type.icon}</span>
                  <span className="font-medium text-white">{type.name}</span>
                  {profiles[type.id] && (
                    <CheckIcon className="h-5 w-5 text-green-400 ml-auto" />
                  )}
                </div>
                <p className="text-sm text-technical-400">{type.description}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Profile Form */}
        <Card className="bg-studio-800 border-technical-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              {profiles[activeProfile] ? 'Edit' : 'Create'} {profileTypes.find(t => t.id === activeProfile)?.name} Profile
            </h2>
            <Badge variant={profiles[activeProfile] ? 'success' : 'warning'}>
              {profiles[activeProfile] ? 'Exists' : 'New'}
            </Badge>
          </div>

          {/* Profile Image Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-technical-300 mb-2">
              Profile Image
            </label>
            <div className="flex items-center space-x-4">
              <Avatar
                src={formData[activeProfile]?.profileImageUrl}
                size="xl"
                fallback={<UserIcon className="h-10 w-10" />}
              />
              <div>
                <Button
                  variant="outline"
                  onClick={() => setShowImageModal(true)}
                  className="mb-2"
                >
                  <CameraIcon className="h-4 w-4 mr-2" />
                  {formData[activeProfile]?.profileImageUrl ? 'Change Image' : 'Upload Image'}
                </Button>
                <p className="text-xs text-technical-400">
                  Recommended: 400x400px, max 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          {renderProfileForm()}

          {/* Actions */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={fetchAllProfiles}
              disabled={loading}
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Button
              onClick={handleSaveProfile}
              loading={loading}
              disabled={loading}
            >
              {profiles[activeProfile] ? 'Update Profile' : 'Create Profile'}
            </Button>
          </div>

          {/* Status Message */}
          {message && (
            <div className={clsx(
              "mt-4 p-3 rounded-lg text-sm",
              message.includes('successfully') 
                ? "bg-green-900/20 border border-green-600 text-green-400"
                : "bg-red-900/20 border border-red-600 text-red-400"
            )}>
              {message}
            </div>
          )}
        </Card>

        {/* Image Upload Modal */}
        <Modal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          title="Upload Profile Image"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Image File
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files[0])}
                className="input"
              />
            </div>
            
            {selectedImage && (
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Selected: {selectedImage.name}
                </p>
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowImageModal(false)}
                disabled={uploadingImage}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleImageUpload(selectedImage)}
                loading={uploadingImage}
                disabled={!selectedImage || uploadingImage}
              >
                Upload Image
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ProfileManager;
