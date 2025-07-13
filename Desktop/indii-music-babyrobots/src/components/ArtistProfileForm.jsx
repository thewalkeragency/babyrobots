import React, { useState, useEffect } from 'react';
import ProfileImageUpload from './ProfileImageUpload';
import { useToast } from './ui/Toast';

const ArtistProfileForm = ({ userId, onProfileSaved }) => {
  const [stageName, setStageName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [proAffiliation, setProAffiliation] = useState('');
  const [ipiNumber, setIpiNumber] = useState('');
  const [socialLinks, setSocialLinks] = useState(''); // Store as string for now
  const [profileImageUrl, setProfileImageUrl] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const addToast = useToast();

  useEffect(() => {
    if (userId) {
      // Fetch existing profile if userId is provided (for editing)
      const fetchProfile = async () => {
        try {
          const response = await fetch(`/api/profile/artist?userId=${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              // In a real app, you'd send auth token here
            },
          });
          const data = await response.json();
          if (response.ok && data.id) {
            setStageName(data.stage_name || '');
            setLegalName(data.legal_name || '');
            setBio(data.bio || '');
            setWebsite(data.website || '');
            setProAffiliation(data.pro_affiliation || '');
            setIpiNumber(data.ipi_number || '');
            setSocialLinks(data.social_links || '');
            setProfileImageUrl(data.profile_image_url || '');
            setIsEditing(true);
          } else if (response.status === 404) {
            setIsEditing(false);
            addToast('No existing profile found. You can create a new one below.', 'info');
          } else {
            addToast(`Error fetching profile: ${data.message || 'Unknown error'}`, 'error');
          }
        } catch (error) {
          console.error('Error fetching artist profile:', error);
          addToast('Error fetching profile. Please try again.', 'error');
        }
      };
      fetchProfile();
    } else {
      // No userId provided, start in create mode
      setIsEditing(false);
      setMessage('Please provide a user ID to create or edit a profile.');
    }
  }, [userId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!userId) {
      addToast('User ID is required to create or update a profile.', 'error');
      return;
    }

    setIsLoading(true);
    const method = isEditing ? 'PUT' : 'POST';
    const url = '/api/profile/artist';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          // In a real app, you'd send auth token here
        },
        body: JSON.stringify({
          userId,
          stageName,
          legalName,
          bio,
          website,
          proAffiliation,
          ipiNumber,
          socialLinks: socialLinks || null, // Send null if empty string
          profileImageUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        addToast(`Profile ${isEditing ? 'updated' : 'created'} successfully!`, 'success');
        setIsEditing(true);
        if (onProfileSaved) onProfileSaved();
      } else {
        addToast(`Failed to ${isEditing ? 'update' : 'create'} profile: ${data.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} artist profile:`, error);
      addToast(`Error ${isEditing ? 'updating' : 'creating'} profile. Please try again.`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '600px', margin: '20px auto' }}>
      <h2>{isEditing ? 'Edit Artist Profile' : 'Create Artist Profile'}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="stageName" style={{ display: 'block', marginBottom: '5px' }}>Stage Name:</label>
          <input type="text" id="stageName" value={stageName} onChange={(e) => setStageName(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="legalName" style={{ display: 'block', marginBottom: '5px' }}>Legal Name:</label>
          <input type="text" id="legalName" value={legalName} onChange={(e) => setLegalName(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="bio" style={{ display: 'block', marginBottom: '5px' }}>Bio:</label>
          <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} rows="4"></textarea>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="website" style={{ display: 'block', marginBottom: '5px' }}>Website:</label>
          <input type="url" id="website" value={website} onChange={(e) => setWebsite(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="proAffiliation" style={{ display: 'block', marginBottom: '5px' }}>PRO Affiliation (e.g., ASCAP, BMI):</label>
          <input type="text" id="proAffiliation" value={proAffiliation} onChange={(e) => setProAffiliation(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="ipiNumber" style={{ display: 'block', marginBottom: '5px' }}>IPI Number:</label>
          <input type="text" id="ipiNumber" value={ipiNumber} onChange={(e) => setIpiNumber(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="socialLinks" style={{ display: 'block', marginBottom: '5px' }}>Social Links (JSON string):</label>
          <textarea id="socialLinks" value={socialLinks} onChange={(e) => setSocialLinks(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} rows="2"></textarea>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="profileImageUrl" style={{ display: 'block', marginBottom: '5px' }}>Profile Image URL:</label>
          <input type="url" id="profileImageUrl" value={profileImageUrl} onChange={(e) => setProfileImageUrl(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <ProfileImageUpload onImageUploadSuccess={setProfileImageUrl} />
        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {isLoading ? 'Saving...' : (isEditing ? 'Update Profile' : 'Create Profile')}
        </button>
      </form>
      
    </div>
  );
};

export default ArtistProfileForm;
